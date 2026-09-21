import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { UserAlreadyExistsException } from '@/exceptions/user-already-exists.exception';

@Injectable()
export class UsersService {
  private saltRounds: number;

  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    this.saltRounds =
      Number(this.configService.get<string>('HASH_SALT', '10')) || 10;
  }

  async create(createUserDto: CreateUserDto) {
    const { username, email } = createUserDto;

    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { email }],
    });

    if (existingUser) {
      throw new UserAlreadyExistsException();
    }

    const hashedPassword = await this.getHashPassword(createUserDto.password);

    const newUser = await this.usersRepository.save({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password: _, ...result } = newUser;
    return result;
  }

  async findOne(query: FindOptionsWhere<User>): Promise<User | null> {
    return this.usersRepository.findOne({ where: query });
  }

  async findMany(
    query: FindOptionsWhere<User> | FindOptionsWhere<User>[],
  ): Promise<User[]> {
    return this.usersRepository.find({ where: query });
  }

  async updateOne(
    query: FindOptionsWhere<User>,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.findOne(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, ...rest } = updateUserDto;
    Object.assign(user, rest);

    if (password) {
      user.password = await this.getHashPassword(password);
    }

    return this.usersRepository.save(user);
  }

  async removeOne(query: FindOptionsWhere<User>): Promise<User> {
    const user = await this.findOne(query);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.usersRepository.remove(user);
  }

  async getWishes(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: { wishes: { owner: true, offers: { user: true } } },
    });

    return user?.wishes ?? [];
  }

  async getWishesByUsername(username: string) {
    const user = await this.usersRepository.findOne({
      where: { username },
      relations: { wishes: { offers: { user: true } } },
    });

    return user?.wishes ?? [];
  }

  private async getHashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }
}
