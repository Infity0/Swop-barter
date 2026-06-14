import { IsString, IsArray, IsNotEmpty, IsOptional, ArrayMinSize } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTradeOfferDto {
  @ApiProperty({ description: 'ID of the receiver user' })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({ type: [String], description: 'IDs of items the initiator offers' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  initiatorItemIds: string[];

  @ApiProperty({ type: [String], description: 'IDs of items the initiator wants from receiver' })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  receiverItemIds: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  message?: string;
}
