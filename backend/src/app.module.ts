import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { UsersModule } from './users/users.module';
import { WishesModule } from './wishes/wishes.module';
import { WishlistsModule } from './wishlists/wishlists.module';
import { OffersModule } from './offers/offers.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host:
          configService.get<string>('DATABASE_HOSTNAME') ||
          configService.get<string>('DATABASE_HOST', 'localhost'),
        port: Number(configService.get<number | string>('DATABASE_PORT', 5432)),
        username:
          configService.get<string>('DATABASE_USERNAME') ||
          configService.get<string>('DATABASE_USER', 'student'),
        password: configService.get<string>('DATABASE_PASSWORD', 'student'),
        database: configService.get<string>('DATABASE_NAME', 'kupipodariday'),
        schema: configService.get<string>('DATABASE_SCHEMA', 'kupipodariday'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    UsersModule,
    WishesModule,
    WishlistsModule,
    OffersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
