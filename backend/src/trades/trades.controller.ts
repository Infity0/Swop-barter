import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { TradesService } from './trades.service';
import { CreateTradeOfferDto } from './dto/create-trade-offer.dto';
import { UpdateTradeOfferDto } from './dto/update-trade-offer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('trades')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('trades')
export class TradesController {
  constructor(private readonly tradesService: TradesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all trades for current user' })
  findAll(@CurrentUser('id') userId: string) {
    return this.tradesService.findAll(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get trade by ID' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.tradesService.findOne(id, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new trade offer' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateTradeOfferDto) {
    return this.tradesService.create(userId, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update trade status (accept/reject/cancel/complete)' })
  updateStatus(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateTradeOfferDto,
  ) {
    return this.tradesService.updateStatus(id, userId, dto);
  }
}
