import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ItemsModule } from './items/items.module';
import { TradesModule } from './trades/trades.module';
import { CategoriesModule } from './categories/categories.module';
import { ChatModule } from './chat/chat.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { FavoritesModule } from './favorites/favorites.module';

import { User } from './users/entities/user.entity';
import { Item } from './items/entities/item.entity';
import { ItemImage } from './items/entities/item-image.entity';
import { TradeOffer } from './trades/entities/trade-offer.entity';
import { Category } from './categories/entities/category.entity';
import { Message } from './chat/entities/message.entity';
import { Review } from './reviews/entities/review.entity';
import { Notification } from './notifications/entities/notification.entity';
import { Favorite } from './favorites/entities/favorite.entity';

import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { CategoriesService } from './categories/categories.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const dbType = config.get<string>('DB_TYPE', 'sqlite');
        const entities = [User, Item, ItemImage, TradeOffer, Category, Message, Review, Notification, Favorite];
        const isProduction = config.get('NODE_ENV') === 'production';

        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: config.get('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 5432),
            username: config.get('DB_USER', 'swop'),
            password: config.get('DB_PASSWORD', 'swop_password'),
            database: config.get('DB_NAME', 'swop_db'),
            entities,
            synchronize: !isProduction,
            logging: !isProduction,
          };
        }

        if (dbType === 'mysql') {
          return {
            type: 'mysql',
            host: config.get('DB_HOST', 'localhost'),
            port: config.get<number>('DB_PORT', 3306),
            username: config.get('DB_USER', 'swop'),
            password: config.get('DB_PASSWORD', 'swop_password'),
            database: config.get('DB_NAME', 'swop_db'),
            entities,
            synchronize: !isProduction,
            logging: !isProduction,
            charset: 'utf8mb4',
          };
        }

        // SQLite — для локальной разработки без PostgreSQL/MySQL
        return {
          type: 'better-sqlite3',
          database: config.get('DB_SQLITE_PATH', './swop-dev.db'),
          entities,
          synchronize: true,
          logging: false,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    ItemsModule,
    TradesModule,
    CategoriesModule,
    ChatModule,
    ReviewsModule,
    NotificationsModule,
    AdminModule,
    FavoritesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly categoriesService: CategoriesService) {}

  async onModuleInit() {
    await this.categoriesService.seed();
  }
}
