import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TradeStatus } from '../entities/trade-offer.entity';

export class UpdateTradeOfferDto {
  @ApiProperty({ enum: [TradeStatus.ACCEPTED, TradeStatus.REJECTED, TradeStatus.CANCELLED, TradeStatus.COMPLETED] })
  @IsEnum([TradeStatus.ACCEPTED, TradeStatus.REJECTED, TradeStatus.CANCELLED, TradeStatus.COMPLETED])
  status: TradeStatus;
}
