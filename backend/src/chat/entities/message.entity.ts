import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TradeOffer } from '../../trades/entities/trade-offer.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  content: string | null;

  @Column({ type: 'varchar', nullable: true })
  imageUrl: string | null;

  @Column({ default: false })
  isRead: boolean;

  @ManyToOne(() => User, (user) => user.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'senderId' })
  sender: User;

  @Column()
  senderId: string;

  @ManyToOne(() => TradeOffer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tradeOfferId' })
  tradeOffer: TradeOffer;

  @Column()
  tradeOfferId: string;

  @CreateDateColumn()
  createdAt: Date;
}
