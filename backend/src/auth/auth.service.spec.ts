import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUsersService = {
    findOne: jest.fn(),
};

const mockJwtService = {
    signAsync: jest.fn(),
};

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
    });

    it('should return token if password matches', async () => {
        const user = { id: '1', username: 'test', password: 'hashedPassword', role: 'user' };
        mockUsersService.findOne.mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));
        mockJwtService.signAsync.mockResolvedValue('token');

        const result = await service.signIn('test', 'password');
        expect(result).toEqual({ access_token: 'token' });
    });

    it('should throw UnauthorizedException if wrong password', async () => {
        const user = { id: '1', username: 'test', password: 'hashedPassword' };
        mockUsersService.findOne.mockResolvedValue(user);
        jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

        await expect(service.signIn('test', 'wrong')).rejects.toThrow(UnauthorizedException);
    });
});
