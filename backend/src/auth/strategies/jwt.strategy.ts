import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '@/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService, private userService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_SECRET', 'jwt_secret'),
    });
  }

  async validate(jwtPayload: { sub: number }) {
    const user = await this.userService.findOne({ id: jwtPayload.sub });

    if (!user) {
      throw new UnauthorizedException();
    }

    const { password: _, ...res } = user;

    return res;
  }
}
