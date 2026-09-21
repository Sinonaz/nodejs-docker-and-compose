import {
  Body,
  Controller,
  Post,
  Req,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { User } from '@/users/entities/user.entity';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { HttpExceptionFilter } from '@/filters/http-exception.filter';

@Controller()
@UseFilters(HttpExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto);
  }

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  signin(@Req() req: { user: User }) {
    return this.authService.signin(req.user);
  }
}
