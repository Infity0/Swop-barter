import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './entities/favorite.entity';
import { Item } from '../items/entities/item.entity';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(Favorite)
    private readonly favoriteRepository: Repository<Favorite>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
  ) {}

  async getMyFavorites(userId: string): Promise<Item[]> {
    const favorites = await this.favoriteRepository.find({
      where: { userId },
      relations: ['item', 'item.images', 'item.owner', 'item.category'],
      order: { createdAt: 'DESC' },
    });
    return favorites.map((f) => f.item);
  }

  async getMyFavoriteIds(userId: string): Promise<string[]> {
    const favorites = await this.favoriteRepository.find({ where: { userId } });
    return favorites.map((f) => f.itemId);
  }

  async add(userId: string, itemId: string): Promise<{ favorited: boolean }> {
    const item = await this.itemRepository.findOne({ where: { id: itemId } });
    if (!item) throw new NotFoundException('Item not found');

    const existing = await this.favoriteRepository.findOne({ where: { userId, itemId } });
    if (existing) return { favorited: true };

    await this.favoriteRepository.save(this.favoriteRepository.create({ userId, itemId }));
    return { favorited: true };
  }

  async remove(userId: string, itemId: string): Promise<{ favorited: boolean }> {
    await this.favoriteRepository.delete({ userId, itemId });
    return { favorited: false };
  }
}
