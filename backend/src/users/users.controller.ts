import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { User } from './entities/user.entity';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findOwn(@Req() req: { user: User }) {
    return req.user;
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  update(@Body() updateUserDto: UpdateUserDto, @Req() req: { user: User }) {
    return this.usersService.updateOne({ id: req.user.id }, updateUserDto);
  }

  @Get('me/wishes')
  @UseGuards(JwtAuthGuard)
  getOwnWishes(@Req() req: { user: User }) {
    return this.usersService.getWishes(req.user.id);
  }

  @Post('find')
  @UseGuards(JwtAuthGuard)
  findMany(@Body() findUsersDto: FindUsersDto) {
    const { query } = findUsersDto;

    return this.usersService.findMany([{ username: query }, { email: query }]);
  }

  @Get(':username')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('username') username: string) {
    const user = await this.usersService.findOne({ username });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { email: _email, password: _password, ...publicProfile } = user;
    return publicProfile;
  }

  @Get(':username/wishes')
  @UseGuards(JwtAuthGuard)
  getWishes(@Param('username') username: string) {
    return this.usersService.getWishesByUsername(username);
  }
}
