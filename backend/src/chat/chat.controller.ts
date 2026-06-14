import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('trades/:tradeId/messages')
  @ApiOperation({ summary: 'Get messages for a trade' })
  getMessages(@Param('tradeId') tradeId: string, @CurrentUser('id') userId: string) {
    return this.chatService.getMessages(tradeId, userId);
  }

  @Post('trades/:tradeId/messages')
  @ApiOperation({ summary: 'Send a message in a trade chat' })
  sendMessage(
    @Param('tradeId') tradeId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.chatService.sendMessage(tradeId, userId, dto.content, dto.imageUrl);
  }

  @Post('trades/:tradeId/image')
  @ApiOperation({ summary: 'Upload an image for a chat message' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/chat',
        filename: (_req, file, cb) => {
          cb(null, `${uuidv4()}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async uploadImage(
    @Param('tradeId') tradeId: string,
    @CurrentUser('id') userId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    await this.chatService.validateAccess(tradeId, userId);
    return { url: `/uploads/chat/${file.filename}` };
  }

  @Patch('trades/:tradeId/read')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Mark trade messages as read' })
  markAsRead(@Param('tradeId') tradeId: string, @CurrentUser('id') userId: string) {
    return this.chatService.markAsRead(tradeId, userId);
  }
}
