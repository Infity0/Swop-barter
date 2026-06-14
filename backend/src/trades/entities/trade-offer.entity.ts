import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Item } from '../../items/entities/item.entity';

export enum TradeStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('trade_offers')
export class TradeOffer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'simple-enum', enum: TradeStatus, default: TradeStatus.PENDING })
  status: TradeStatus;

  @Column({ type: 'text', nullable: true })
  message: string;

  @ManyToOne(() => User, (user) => user.sentTrades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'initiatorId' })
  initiator: User;

  @Column()
  initiatorId: string;

  @ManyToOne(() => User, (user) => user.receivedTrades, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'receiverId' })
  receiver: User;

  @Column()
  receiverId: string;

  @ManyToMany(() => Item)
  @JoinTable({
    name: 'trade_offer_initiator_items',
    joinColumn: { name: 'tradeOfferId' },
    inverseJoinColumn: { name: 'itemId' },
  })
  initiatorItems: Item[];

  @ManyToMany(() => Item)
  @JoinTable({
    name: 'trade_offer_receiver_items',
    joinColumn: { name: 'tradeOfferId' },
    inverseJoinColumn: { name: 'itemId' },
  })
  receiverItems: Item[];

  @Column({ nullable: true })
  completedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
