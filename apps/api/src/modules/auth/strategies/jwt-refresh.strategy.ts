import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),

      secretOrKey:
        configService.getOrThrow<string>(
          'JWT_REFRESH_SECRET',
        ),

      passReqToCallback: true,

      ignoreExpiration: false,
    });
  }

  validate(request: Request, payload: JwtPayload) {
    const authorization =
      request.get('authorization');

    const refreshToken = authorization?.replace(
      'Bearer ',
      '',
    );

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      refreshToken,
    };
  }
}