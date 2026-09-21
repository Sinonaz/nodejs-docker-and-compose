import { Wish } from '@/wishes/entities/wish.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { WishlistsController } from './wishlists.controller';
import { WishlistsService } from './wishlists.service';

describe('WishlistsController', () => {
  let controller: WishlistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistsController],
      providers: [
        {
          provide: WishlistsService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Wishlist),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Wish),
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<WishlistsController>(WishlistsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
