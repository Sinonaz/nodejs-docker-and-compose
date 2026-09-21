import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateWishDto } from './dto/create-wish.dto';
import { UpdateWishDto } from './dto/update-wish.dto';
import { Wish } from './entities/wish.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private readonly wishesRepository: Repository<Wish>,
  ) {}

  async create(createWishDto: CreateWishDto, ownerId: number): Promise<Wish> {
    const wish = this.wishesRepository.create({
      ...createWishDto,
      owner: { id: ownerId },
    });

    return this.wishesRepository.save(wish);
  }

  async findOne(query: FindOptionsWhere<Wish>): Promise<Wish | null> {
    return this.wishesRepository.findOne({ where: query });
  }

  async findMany(query: FindOptionsWhere<Wish>): Promise<Wish[]> {
    return this.wishesRepository.find({ where: query });
  }

  async updateOne(
    query: FindOptionsWhere<Wish>,
    updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.findOne(query);

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    Object.assign(wish, updateWishDto);

    return this.wishesRepository.save(wish);
  }

  async removeOne(query: FindOptionsWhere<Wish>): Promise<Wish> {
    const wish = await this.findOne(query);

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    return this.wishesRepository.remove(wish);
  }

  async findLast(): Promise<Wish[]> {
    return this.wishesRepository.find({
      relations: { owner: true },
      order: { createdAt: 'DESC' },
      take: 40,
    });
  }

  async findTop(): Promise<Wish[]> {
    return this.wishesRepository.find({
      relations: { owner: true },
      order: { copied: 'DESC' },
      take: 20,
    });
  }

  async findWishById(id: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: { owner: true, offers: { user: true } },
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    return wish;
  }

  async updateWish(
    id: number,
    userId: number,
    updateWishDto: UpdateWishDto,
  ): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: { owner: true, offers: true },
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You can only edit your own wishes');
    }

    if (wish.offers.length > 0 && updateWishDto.price !== undefined) {
      throw new ForbiddenException(
        'Cannot change the price of a wish that already has offers',
      );
    }

    return this.updateOne({ id }, updateWishDto);
  }

  async removeWish(id: number, userId: number): Promise<Wish> {
    const wish = await this.wishesRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    if (wish.owner.id !== userId) {
      throw new ForbiddenException('You can only delete your own wishes');
    }

    return this.removeOne({ id });
  }

  async copyWish(id: number, userId: number): Promise<Wish> {
    const wish = await this.findOne({ id });

    if (!wish) {
      throw new NotFoundException('Wish not found');
    }

    wish.copied += 1;
    await this.wishesRepository.save(wish);

    const copy = this.wishesRepository.create({
      name: wish.name,
      link: wish.link,
      image: wish.image,
      price: wish.price,
      description: wish.description,
      owner: { id: userId },
    });

    return this.wishesRepository.save(copy);
  }
}
