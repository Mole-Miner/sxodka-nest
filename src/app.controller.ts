import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from './auth/jwt.auth.guard';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';

@Controller()
export class AppController {
  constructor(private readonly _auth: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req) {
    return this._auth.login(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('protected')
  getHello(@Request() req) {
    return req.user;
  }
}
