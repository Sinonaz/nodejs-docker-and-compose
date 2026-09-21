import { Wish } from '@/wishes/entities/wish.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, In, Repository } from 'typeorm';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { Wishlist } from './entities/wishlist.entity';

@Injectable()
export class WishlistsService {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
    @InjectRepository(Wish)
    private readonly wishesRepository: Repository<Wish>,
  ) {}

  async create(
    createWishlistDto: CreateWishlistDto,
    ownerId: number,
  ): Promise<Wishlist> {
    const { itemsId, ...rest } = createWishlistDto;

    const items = itemsId?.length
      ? await this.wishesRepository.find({ where: { id: In(itemsId) } })
      : [];

    const wishlist = this.wishlistsRepository.create({
      ...rest,
      items,
      owner: { id: ownerId },
    });

    return this.wishlistsRepository.save(wishlist);
  }

  async findOne(query: FindOptionsWhere<Wishlist>): Promise<Wishlist | null> {
    return this.wishlistsRepository.findOne({ where: query });
  }

  async findMany(query: FindOptionsWhere<Wishlist>): Promise<Wishlist[]> {
    return this.wishlistsRepository.find({ where: query });
  }

  async updateOne(
    query: FindOptionsWhere<Wishlist>,
    updateWishlistDto: UpdateWishlistDto,
  ): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: query,
      relations: { items: true },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    const { itemsId, ...rest } = updateWishlistDto;
    Object.assign(wishlist, rest);

    if (itemsId) {
      wishlist.items = await this.wishesRepository.find({
        where: { id: In(itemsId) },
      });
    }

    return this.wishlistsRepository.save(wishlist);
  }

  async removeOne(query: FindOptionsWhere<Wishlist>): Promise<Wishlist> {
    const wishlist = await this.findOne(query);

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return this.wishlistsRepository.remove(wishlist);
  }

  async findAll(): Promise<Wishlist[]> {
    return this.wishlistsRepository.find({
      relations: { owner: true, items: true },
    });
  }

  async findWishlistById(id: number): Promise<Wishlist> {
    const wishlist = await this.wishlistsRepository.findOne({
      where: { id },
      relations: { owner: true, items: true },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    return wishlist;
  }
}
