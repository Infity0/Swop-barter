import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { QueryItemsDto } from './dto/query-items.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all active items (paginated)' })
  findAll(@Query() query: QueryItemsDto) {
    return this.itemsService.findAll(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get item by ID' })
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Get('my/items')
  @ApiOperation({ summary: 'Get current user items' })
  getMyItems(@CurrentUser('id') userId: string) {
    return this.itemsService.findByOwner(userId);
  }

  @Get('matches/for-me')
  @ApiOperation({ summary: 'Get items matching current user desired items' })
  getMatches(@CurrentUser('id') userId: string) {
    return this.itemsService.findMatches(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create new item' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateItemDto) {
    return this.itemsService.create(userId, dto);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Upload item images' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: './uploads/items',
        filename: (_req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  uploadImages(
    @Param('id') itemId: string,
    @CurrentUser('id') userId: string,
    @UploadedFiles(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
        ],
      }),
    )
    files: Express.Multer.File[],
  ) {
    return this.itemsService.addImages(itemId, userId, files);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update item' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateItemDto,
  ) {
    return this.itemsService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete item' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.itemsService.remove(id, userId);
  }

  @Delete('images/:imageId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete item image' })
  removeImage(@Param('imageId') imageId: string, @CurrentUser('id') userId: string) {
    return this.itemsService.removeImage(imageId, userId);
  }
}
