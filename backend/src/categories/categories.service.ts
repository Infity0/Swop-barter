import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { isActive: true, parentId: IsNull() },
      relations: ['children'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async seed(): Promise<void> {
    const count = await this.categoryRepository.count();
    // Always run to update names if needed
    void count;

    const categories = [
      { name: 'Электроника', slug: 'electronics', icon: 'laptop' },
      { name: 'Одежда', slug: 'clothing', icon: 'shirt' },
      { name: 'Книги', slug: 'books', icon: 'book' },
      { name: 'Мебель', slug: 'furniture', icon: 'sofa' },
      { name: 'Спорт', slug: 'sports', icon: 'dumbbell' },
      { name: 'Игрушки и игры', slug: 'toys-games', icon: 'gamepad' },
      { name: 'Музыка', slug: 'music', icon: 'music' },
      { name: 'Творчество и рукоделие', slug: 'art-crafts', icon: 'palette' },
      { name: 'Сад и огород', slug: 'garden', icon: 'flower' },
      { name: 'Прочее', slug: 'other', icon: 'box' },
    ];

    for (const cat of categories) {
      let existing = await this.categoryRepository.findOne({ where: { slug: cat.slug } });
      if (!existing) {
        existing = await this.categoryRepository.findOne({ where: { name: cat.name } });
      }
      if (existing) {
        await this.categoryRepository.update(existing.id, { name: cat.name, slug: cat.slug });
      } else {
        await this.categoryRepository.save(this.categoryRepository.create(cat));
      }
    }
  }
}
