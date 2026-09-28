import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import { RegisterInput, LoginInput, AuthPayload, UserType } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(input: RegisterInput): Promise<AuthPayload> {
    const existing = await this.userModel.findOne({ email: input.email.toLowerCase() });
    if (existing) {
      throw new ConflictException('An account with this email already exists.');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = new this.userModel({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash,
      currency: input.currency || 'USD',
    });

    const savedUser = await user.save();
    const token = this.generateToken(savedUser);

    return {
      accessToken: token,
      user: this.mapUser(savedUser),
    };
  }

  async login(input: LoginInput): Promise<AuthPayload> {
    const user = await this.userModel.findOne({ email: input.email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(input.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const token = this.generateToken(user);
    return {
      accessToken: token,
      user: this.mapUser(user),
    };
  }

  generateToken(user: UserDocument): string {
    const payload = { sub: user._id.toString(), email: user.email };
    return this.jwtService.sign(payload);
  }

  mapUser(user: UserDocument): UserType {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      currency: user.currency || 'USD',
      avatarUrl: user.avatarUrl || '',
      role: user.role || 'user',
      createdAt: (user as any).createdAt || new Date(),
    };
  }
}
