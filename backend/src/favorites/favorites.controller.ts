import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user favorite items' })
  getMyFavorites(@CurrentUser('id') userId: string) {
    return this.favoritesService.getMyFavorites(userId);
  }

  @Get('ids')
  @ApiOperation({ summary: 'Get current user favorite item ids' })
  getMyFavoriteIds(@CurrentUser('id') userId: string) {
    return this.favoritesService.getMyFavoriteIds(userId);
  }

  @Post(':itemId')
  @ApiOperation({ summary: 'Add item to favorites' })
  add(@Param('itemId') itemId: string, @CurrentUser('id') userId: string) {
    return this.favoritesService.add(userId, itemId);
  }

  @Delete(':itemId')
  @ApiOperation({ summary: 'Remove item from favorites' })
  remove(@Param('itemId') itemId: string, @CurrentUser('id') userId: string) {
    return this.favoritesService.remove(userId, itemId);
  }
}
