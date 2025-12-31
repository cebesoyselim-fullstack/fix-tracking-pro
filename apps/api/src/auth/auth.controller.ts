import { Controller, Post, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserWithoutPassword } from './interfaces/jwt-payload.interface';

interface RequestWithUser extends Request {
  user: UserWithoutPassword;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Request() req: RequestWithUser) {
    // req.user is set by LocalStrategy after validation
    return this.authService.login(req.user);
  }
}

