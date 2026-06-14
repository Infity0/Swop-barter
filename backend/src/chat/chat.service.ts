import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';
import { TradeOffer } from '../trades/entities/trade-offer.entity';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(TradeOffer)
    private readonly tradeRepository: Repository<TradeOffer>,
  ) {}

  async validateAccess(tradeId: string, userId: string): Promise<TradeOffer> {
    const trade = await this.tradeRepository.findOne({ where: { id: tradeId } });
    if (!trade) throw new NotFoundException('Trade not found');
    if (trade.initiatorId !== userId && trade.receiverId !== userId) {
      throw new ForbiddenException();
    }
    return trade;
  }

  async getMessages(tradeId: string, userId: string): Promise<Message[]> {
    await this.validateAccess(tradeId, userId);
    return this.messageRepository.find({
      where: { tradeOfferId: tradeId },
      relations: ['sender'],
      order: { createdAt: 'ASC' },
    });
  }

  async sendMessage(
    tradeId: string,
    senderId: string,
    content?: string,
    imageUrl?: string,
  ): Promise<Message> {
    if (!content?.trim() && !imageUrl) {
      throw new BadRequestException('Message must have content or an image');
    }
    await this.validateAccess(tradeId, senderId);
    const message = this.messageRepository.create({
      content: content?.trim() || null,
      imageUrl: imageUrl || null,
      senderId,
      tradeOfferId: tradeId,
    });
    const saved = await this.messageRepository.save(message);
    return this.messageRepository.findOne({
      where: { id: saved.id },
      relations: ['sender'],
    }) as Promise<Message>;
  }

  async markAsRead(tradeId: string, userId: string): Promise<void> {
    await this.validateAccess(tradeId, userId);
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('tradeOfferId = :tradeId AND senderId != :userId AND isRead = false', {
        tradeId,
        userId,
      })
      .execute();
  }
}
