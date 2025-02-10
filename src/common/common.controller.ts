import {
  BadRequestException,
  Controller,
  Get,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('common')
@ApiTags('common')
@ApiBearerAuth()
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  // 여러개 사진 올리도록 수정

  // 파일 선업로드 방식 : 프론트엔드에서 업로드할 파일을 선택후 업로드 완료를 하게 되면 temp 폴더로 파일을 미리 올려두고,
  // 게시글 저장을 하게 된다면 선업로드된 temp 폴더에서 files 폴더로 이동만 하면 되도록 하는 방식.
  @Post('files')
  @ApiOperation({
    summary: '파일 선업로드',
    description: '파일 선업로드',
  })
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      // 파일 사이즈 제한
      limits: {
        fileSize: 20000000,
      },
      fileFilter(req, file, callback) {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'video/mp4',
          'video/mpeg',
          'video/webm',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              '이미지 또는 영상 파일만 업로드 가능합니다.',
            ),
            false,
          );
        }
        return callback(null, true);
      },
    }),
  )
  async createFiles(
    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    const fileNames = files.map((file) => file.filename);

    return {
      fileNames: fileNames,
    };
  }
}
