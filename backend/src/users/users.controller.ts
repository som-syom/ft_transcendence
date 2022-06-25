import {
  Controller,
  Get,
  Body,
  Post,
  Param,
  ParseIntPipe,
  UploadedFile,
  UseInterceptors,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { SimpleUserDto, UserProfileDto } from './dto/users.dto';
import { diskStorage } from 'multer';
import { editFileName, imageFileFilter } from '../files/file-uploading.utils';
import { FileInterceptor } from '@nestjs/platform-express';
import { GameRecordDto } from './dto/gameRecord.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'seungyel✅ 이미지 업로드' })
  @Post('/:id/uploadImage')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './files',
        filename: editFileName,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  async uploadedFile(@UploadedFile() file, @Param('id') id: number) {
    const response = {
      originalname: file.originalname,
      filename: file.filename,
      UpdateImg: await this.usersService.findByNicknameAndUpdateImg(
        id,
        file.filename,
      ),
    };
    return response;
  }

  @ApiOperation({ summary: 'kankim✅ 모든 유저 닉네임 가져오기' })
  @Get('')
  async getUsers(): Promise<SimpleUserDto[]> {
    const userInfo = await this.usersService.getUsers();

    return userInfo;
  }

  @ApiOperation({ summary: 'kankim✅ 특정 유저의 프로필 조회' })
  @Get(':id')
  async getUserProfile(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<UserProfileDto> {
    const userProfile = await this.usersService.getUserProfile(id);

    return userProfile;
  }

  @ApiOperation({ summary: 'kankim✅ 친구 추가' })
  @Post(':id/friends')
  async addFriend(
    @Param('id', ParseIntPipe) myId: number,
    @Body('targetId', ParseIntPipe) targetId: number,
  ): Promise<void> {
    await this.usersService.addFriend(myId, targetId);
  }

  @ApiOperation({ summary: 'kankim✅ 친구 목록( 닉네임 ) 조회' })
  @Get(':id/friends')
  async getFriends(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<SimpleUserDto[]> {
    return await this.usersService.getFriends(userId);
  }

  @ApiOperation({ summary: 'kankim✅ 전적 조회' })
  @Get(':id/gameRecords')
  async getGameRecords(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<GameRecordDto[]> {
    const gameRecords = this.usersService.getGameRecords(userId);

    return gameRecords;
  }

  @ApiOperation({ summary: 'kankim✅ 닉네임 변경' })
  @Put(':id/nickname')
  async updateNickname(
    @Param('id', ParseIntPipe) userId: number,
    @Body('nickname') body: string,
  ): Promise<UserProfileDto> {
    const user = this.usersService.updateNickname(userId, body);

    return user;
  }
}
