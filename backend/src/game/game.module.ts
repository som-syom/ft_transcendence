import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/users.entity';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { GameGateway } from './game.gateway';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { GameEnv } from './class/game.class.GameEnv';
import { UserStatusModule } from 'userStatus/userStatus.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    AuthModule,
    UserStatusModule,
  ],
  controllers: [GameController],
  providers: [GameService, GameGateway, GameEnv],
  exports: [PassportModule],
})
export class GameModule {}
