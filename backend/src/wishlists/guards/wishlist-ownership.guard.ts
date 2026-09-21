import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';

interface RequestWithUser {
  user?: { id: number };
  params: { id?: string };
  wishlist?: Wishlist;
}

@Injectable()
export class WishlistOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Wishlist)
    private readonly wishlistsRepository: Repository<Wishlist>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    const currentUserId = request.user?.id;
    const wishlistId = Number(request.params.id);

    const wishlist = await this.wishlistsRepository.findOne({
      where: { id: wishlistId },
      relations: { owner: true },
    });

    if (!wishlist) {
      throw new NotFoundException('Wishlist not found');
    }

    if (!currentUserId || wishlist.owner?.id !== currentUserId) {
      throw new ForbiddenException('You do not have rights to do this action');
    }

    request.wishlist = wishlist;

    return true;
  }
}
