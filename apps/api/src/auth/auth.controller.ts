import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, TokenResponse } from './dto';
import { Public, CurrentUser } from '../rbac';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * POST /auth/login
   * Authenticate user and return tokens
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<TokenResponse> {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/refresh
   * Get new access token using refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Body() dto: RefreshDto,
  ): Promise<{ accessToken: string; expiresIn: number }> {
    return this.authService.refresh(dto.refreshToken);
  }

  /**
   * POST /auth/logout
   * Invalidate refresh token
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser('userId') userId: string): { message: string } {
    return this.authService.logout(userId);
  }

  /**
   * GET /auth/me (alias for user profile)
   * Handled by UsersController /users/me
   */
}
