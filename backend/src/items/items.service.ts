import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Item, ItemStatus } from './entities/item.entity';
import { ItemImage } from './entities/item-image.entity';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { QueryItemsDto } from './dto/query-items.dto';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(ItemImage)
    private readonly imageRepository: Repository<ItemImage>,
  ) {}

  async create(ownerId: string, dto: CreateItemDto): Promise<Item> {
    const payload: Partial<Item> = {
      ...(dto as any),
      ownerId,
      categoryId: dto.categoryId || null,
      city: dto.city || null,
    };
    return this.itemRepository.save(payload as Item);
  }

  async findAll(query: QueryItemsDto) {
    const { search, categoryId, condition, city, page, limit, sortBy, sortOrder } = query;

    const qb = this.itemRepository
      .createQueryBuilder('item')
      .leftJoinAndSelect('item.images', 'images')
      .leftJoinAndSelect('item.owner', 'owner')
      .leftJoinAndSelect('item.category', 'category')
      .where('item.status = :status', { status: ItemStatus.ACTIVE });

    if (search) {
      qb.andWhere('(item.title LIKE :search OR item.description LIKE :search)', {
        search: `%${search}%`,
      });
    }
    if (categoryId) qb.andWhere('item.categoryId = :categoryId', { categoryId });
    if (condition) qb.andWhere('item.condition = :condition', { condition });
    if (city) qb.andWhere('item.city LIKE :city', { city: `%${city}%` });

    const allowedSortFields = ['createdAt', 'estimatedValue', 'viewsCount'];
    const sort = sortBy && allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    qb.orderBy(`item.${sort}`, sortOrder === 'ASC' ? 'ASC' : 'DESC');

    const p = page ?? 1;
    const l = limit ?? 20;
    const offset = (p - 1) * l;
    qb.skip(offset).take(l);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: p, limit: l, totalPages: Math.ceil(total / l) };
  }

  private async findOneInternal(id: string): Promise<Item> {
    const item = await this.itemRepository.findOne({
      where: { id },
      relations: ['images', 'owner', 'category'],
    });
    if (!item) throw new NotFoundException('Item not found');
    return item;
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.findOneInternal(id);
    await this.itemRepository.increment({ id }, 'viewsCount', 1);
    return item;
  }

  async findByOwner(ownerId: string): Promise<Item[]> {
    return this.itemRepository.find({
      where: { ownerId },
      relations: ['images', 'category'],
      order: { createdAt: 'DESC' },
    });
  }

  async findMatches(userId: string): Promise<{ item: Item; mutual: boolean; matchedOn: string[] }[]> {
    const myItems = await this.itemRepository.find({
      where: { ownerId: userId, status: ItemStatus.ACTIVE },
      relations: ['category'],
    });

    const myKeywords = new Set<string>();
    for (const item of myItems) {
      for (const desired of item.desiredItems ?? []) {
        const keyword = desired.trim().toLowerCase();
        if (keyword) myKeywords.add(keyword);
      }
    }
    if (myKeywords.size === 0) return [];

    const myTitlesAndCategories = new Set<string>();
    for (const item of myItems) {
      myTitlesAndCategories.add(item.title.toLowerCase());
      if (item.category?.name) myTitlesAndCategories.add(item.category.name.toLowerCase());
    }

    const candidates = await this.itemRepository.find({
      where: { status: ItemStatus.ACTIVE },
      relations: ['images', 'owner', 'category'],
      order: { createdAt: 'DESC' },
    });

    const results: { item: Item; mutual: boolean; matchedOn: string[] }[] = [];

    for (const candidate of candidates) {
      if (candidate.ownerId === userId) continue;

      const candidateTexts = [candidate.title.toLowerCase()];
      if (candidate.category?.name) candidateTexts.push(candidate.category.name.toLowerCase());

      const matchedOn: string[] = [];
      for (const keyword of myKeywords) {
        if (candidateTexts.some((text) => text.includes(keyword) || keyword.includes(text))) {
          matchedOn.push(keyword);
        }
      }
      if (matchedOn.length === 0) continue;

      let mutual = false;
      for (const desired of candidate.desiredItems ?? []) {
        const keyword = desired.trim().toLowerCase();
        if (!keyword) continue;
        if ([...myTitlesAndCategories].some((text) => text.includes(keyword) || keyword.includes(text))) {
          mutual = true;
          break;
        }
      }

      results.push({ item: candidate, mutual, matchedOn });
    }

    results.sort((a, b) => Number(b.mutual) - Number(a.mutual));
    return results;
  }

  async update(id: string, userId: string, dto: UpdateItemDto): Promise<Item> {
    const item = await this.findOneInternal(id);
    if (item.ownerId !== userId) throw new ForbiddenException();
    const updateData: any = { ...dto };
    if ('categoryId' in updateData && !updateData.categoryId) updateData.categoryId = null;
    if ('city' in updateData && !updateData.city) updateData.city = null;
    await this.itemRepository.update(id, updateData);
    return this.findOneInternal(id);
  }

  async remove(id: string, userId: string): Promise<void> {
    const item = await this.findOneInternal(id);
    if (item.ownerId !== userId) throw new ForbiddenException();
    await this.itemRepository.remove(item);
  }

  async addImages(itemId: string, userId: string, files: Express.Multer.File[]): Promise<Item> {
    const item = await this.findOneInternal(itemId);
    if (item.ownerId !== userId) throw new ForbiddenException();

    const existingCount = item.images?.length ?? 0;
    const images = files.map((file, idx) =>
      this.imageRepository.create({
        url: `/uploads/items/${file.filename}`,
        itemId,
        isPrimary: existingCount === 0 && idx === 0,
        order: existingCount + idx,
      }),
    );
    await this.imageRepository.save(images);
    return this.findOneInternal(itemId);
  }

  async removeImage(imageId: string, userId: string): Promise<void> {
    const image = await this.imageRepository.findOne({
      where: { id: imageId },
      relations: ['item'],
    });
    if (!image) throw new NotFoundException('Image not found');
    if (image.item.ownerId !== userId) throw new ForbiddenException();
    await this.imageRepository.remove(image);
  }
}
