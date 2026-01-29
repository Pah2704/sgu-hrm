import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async signIn(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(username);
        if (!user) {
            throw new UnauthorizedException();
        }
        const isMatch = await bcrypt.compare(pass, user.password);
        if (!isMatch) {
            throw new UnauthorizedException();
        }
        const payload = {
            sub: user.id,
            username: user.username,
            role: user.role,
            employeeId: user.employeeId
        };
        return {
            access_token: await this.jwtService.signAsync(payload),
            user: { ...payload, id: user.id }
        };
    }

    async changePassword(userId: string, oldPass: string, newPass: string) {
        const user = await this.usersService.findById(userId);
        if (!user) throw new UnauthorizedException('User not found');

        const isMatch = await bcrypt.compare(oldPass, user.password);
        if (!isMatch) throw new UnauthorizedException('Incorrect old password');

        const hashed = await bcrypt.hash(newPass, 10);
        user.password = hashed;
        return this.usersService.create(user); // create handles update if ID exists (using save)
    }
}
