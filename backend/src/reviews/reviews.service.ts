import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity';
import { TradeOffer, TradeStatus } from '../trades/entities/trade-offer.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TradeOffer)
    private readonly tradeRepository: Repository<TradeOffer>,
  ) {}

  async create(reviewerId: string, dto: CreateReviewDto): Promise<Review> {
    const trade = await this.tradeRepository.findOne({ where: { id: dto.tradeOfferId } });
    if (!trade) throw new NotFoundException('Trade not found');
    if (trade.status !== TradeStatus.COMPLETED) {
      throw new ForbiddenException('Can only review after a completed trade');
    }
    if (trade.initiatorId !== reviewerId && trade.receiverId !== reviewerId) {
      throw new ForbiddenException('Not a participant of this trade');
    }

    const existing = await this.reviewRepository.findOne({
      where: { reviewerId, tradeOfferId: dto.tradeOfferId },
    });
    if (existing) throw new ConflictException('Already reviewed this trade');

    const review = this.reviewRepository.create({ ...dto, reviewerId });
    const saved = await this.reviewRepository.save(review);

    // Recalculate user rating
    await this.updateUserRating(dto.revieweeId);

    return saved;
  }

  async findByUser(userId: string): Promise<Review[]> {
    return this.reviewRepository.find({
      where: { revieweeId: userId },
      relations: ['reviewer'],
      order: { createdAt: 'DESC' },
    });
  }

  private async updateUserRating(userId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'count')
      .where('review.revieweeId = :userId', { userId })
      .getRawOne();

    await this.userRepository.update(userId, {
      rating: parseFloat(result.avg) || 0,
      reviewsCount: parseInt(result.count) || 0,
    });
  }
}
