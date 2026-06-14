import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { TradeOffer, TradeStatus } from './entities/trade-offer.entity';
import { Item, ItemStatus } from '../items/entities/item.entity';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { CreateTradeOfferDto } from './dto/create-trade-offer.dto';
import { UpdateTradeOfferDto } from './dto/update-trade-offer.dto';

@Injectable()
export class TradesService {
  constructor(
    @InjectRepository(TradeOffer)
    private readonly tradeRepository: Repository<TradeOffer>,
    @InjectRepository(Item)
    private readonly itemRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(initiatorId: string, dto: CreateTradeOfferDto): Promise<TradeOffer> {
    if (initiatorId === dto.receiverId) {
      throw new BadRequestException('Cannot trade with yourself');
    }

    const initiatorItems = await this.itemRepository.find({
      where: { id: In(dto.initiatorItemIds), ownerId: initiatorId },
    });
    if (initiatorItems.length !== dto.initiatorItemIds.length) {
      throw new ForbiddenException('Some initiator items are not yours');
    }

    const receiverItems = await this.itemRepository.find({
      where: { id: In(dto.receiverItemIds), ownerId: dto.receiverId },
    });
    if (receiverItems.length !== dto.receiverItemIds.length) {
      throw new NotFoundException('Some receiver items not found');
    }

    const busy = [...initiatorItems, ...receiverItems].some(
      (i) => i.status !== ItemStatus.ACTIVE,
    );
    if (busy) throw new BadRequestException('One or more items are not available for trade');

    const trade = this.tradeRepository.create({
      initiatorId,
      receiverId: dto.receiverId,
      message: dto.message,
      initiatorItems,
      receiverItems,
    });
    const saved = await this.tradeRepository.save(trade);

    await this.notificationsService.create(dto.receiverId, {
      type: NotificationType.TRADE_OFFER,
      title: 'Новое предложение обмена',
      body: 'Кто-то хочет обменяться с вами!',
      referenceId: saved.id,
    });

    return saved;
  }

  async findAll(userId: string) {
    return this.tradeRepository.find({
      where: [{ initiatorId: userId }, { receiverId: userId }],
      relations: ['initiator', 'receiver', 'initiatorItems', 'initiatorItems.images', 'receiverItems', 'receiverItems.images'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<TradeOffer> {
    const trade = await this.tradeRepository.findOne({
      where: { id },
      relations: ['initiator', 'receiver', 'initiatorItems', 'initiatorItems.images', 'receiverItems', 'receiverItems.images'],
    });
    if (!trade) throw new NotFoundException('Trade offer not found');
    if (trade.initiatorId !== userId && trade.receiverId !== userId) {
      throw new ForbiddenException();
    }
    return trade;
  }

  async updateStatus(id: string, userId: string, dto: UpdateTradeOfferDto): Promise<TradeOffer> {
    const trade = await this.findOne(id, userId);

    if (dto.status === TradeStatus.CANCELLED && trade.initiatorId !== userId) {
      throw new ForbiddenException('Only initiator can cancel');
    }
    if (
      (dto.status === TradeStatus.ACCEPTED || dto.status === TradeStatus.REJECTED) &&
      trade.receiverId !== userId
    ) {
      throw new ForbiddenException('Only receiver can accept or reject');
    }
    if (
      dto.status === TradeStatus.COMPLETED &&
      trade.initiatorId !== userId &&
      trade.receiverId !== userId
    ) {
      throw new ForbiddenException();
    }

    if (dto.status === TradeStatus.ACCEPTED) {
      const allItems = [...(trade.initiatorItems ?? []), ...(trade.receiverItems ?? [])];
      await this.itemRepository.update(
        allItems.map((i) => i.id),
        { status: ItemStatus.IN_TRADE },
      );
      await this.notificationsService.create(trade.initiatorId, {
        type: NotificationType.TRADE_ACCEPTED,
        title: 'Предложение принято',
        body: 'Ваше предложение обмена было принято!',
        referenceId: id,
      });
    }

    if (dto.status === TradeStatus.COMPLETED) {
      trade.completedAt = new Date();
      const allItems = [...(trade.initiatorItems ?? []), ...(trade.receiverItems ?? [])];
      await this.itemRepository.update(
        allItems.map((i) => i.id),
        { status: ItemStatus.TRADED },
      );
      await this.userRepository.increment({ id: trade.initiatorId }, 'successfulTrades', 1);
      await this.userRepository.increment({ id: trade.receiverId }, 'successfulTrades', 1);
    }

    if (dto.status === TradeStatus.REJECTED || dto.status === TradeStatus.CANCELLED) {
      const allItems = [...(trade.initiatorItems ?? []), ...(trade.receiverItems ?? [])];
      const inTradeItems = allItems.filter((i) => i.status === ItemStatus.IN_TRADE);
      if (inTradeItems.length > 0) {
        await this.itemRepository.update(
          inTradeItems.map((i) => i.id),
          { status: ItemStatus.ACTIVE },
        );
      }
    }

    if (dto.status === TradeStatus.REJECTED) {
      await this.notificationsService.create(trade.initiatorId, {
        type: NotificationType.TRADE_REJECTED,
        title: 'Предложение отклонено',
        body: 'Ваше предложение обмена было отклонено.',
        referenceId: id,
      });
    }

    trade.status = dto.status;
    return this.tradeRepository.save(trade);
  }
}
