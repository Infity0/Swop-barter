import { PartialType } from '@nestjs/swagger';
import { CreateItemDto } from './create-item.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ItemStatus } from '../entities/item.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateItemDto extends PartialType(CreateItemDto) {
  @ApiProperty({ enum: ItemStatus, required: false })
  @IsOptional()
  @IsEnum(ItemStatus)
  status?: ItemStatus;
}
