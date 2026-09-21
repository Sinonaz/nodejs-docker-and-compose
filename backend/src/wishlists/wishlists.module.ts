import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { Wish } from '@/wishes/entities/wish.entity';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistOwnershipGuard } from './guards/wishlist-ownership.guard';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist, Wish])],
  controllers: [WishlistsController],
  providers: [WishlistsService, JwtAuthGuard, WishlistOwnershipGuard],
  exports: [WishlistsService],
})
export class WishlistsModule {}
