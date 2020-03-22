import {
  Controller,
  Get,
  Body,
  HttpStatus,
  UseInterceptors,
  Post,
  UploadedFile,
  Req,
  Res,
  Param,
  Redirect,
  Put,
} from '@nestjs/common';
import {
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadCallPayloadDto } from './dto/upload-call-payload.dto';
import { TranslatedCallPayloadDto } from './dto/translated-call-payload.dto';
import { AudioStorageService } from '../audio-storage/audio-storage.service';
import { AudioFile } from '../audio-storage/audio-storage.entity';

@Controller('call')
@ApiTags('Calls')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
export class CallController {
  constructor(private readonly audioStorageService: AudioStorageService) {}

  @Get()
  @ApiOkResponse({ description: 'Successful' })
  index(): string {
    return 'call';
  }

  @Get('download/:id')
  @ApiOkResponse({ description: 'Successful' })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  @ApiParam({
    name: 'id',
    description: 'audio id',
    type: 'integer',
  })
  @Redirect('https://google.com', 302)
  async download(
    @Req() req: any,
    @Res() res: any,
    @Param('id') id: number,
  ): Promise<any> {
    const audioFile: AudioFile = await this.audioStorageService.getById(id);

    return {
      url: audioFile.path,
      statusCode: 302,
    };
  }

  @Get('webhook')
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async webhook(): Promise<any> {}

  @Get('upload')
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  async init_upload(): Promise<any> {
    return { id: await this.audioStorageService.create() };
  }

  @Post('upload/:id')
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'audio id',
    type: 'integer',
  })
  async upload(
    @Req() req: any,
    @Res() res: any,
    @Param('id') id: number,
  ): Promise<any> {
    try {
      const fileEntry = await this.audioStorageService.getById(id);
      if (fileEntry) {
        await this.audioStorageService.uploadToAWS(req, res, fileEntry);
      } else {
        return res.status(400).json(`Failed to upload file, undefined id.`);
      }
    } catch (error) {
      return res.status(500).json(`Failed to upload file: ${error.message}`);
    }
  }

  @Put('translated/:id')
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Success' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiParam({
    name: 'id',
    description: 'audio id',
    type: 'integer',
  })
  async translated(@Res() res: any, @Param('id') id: number): Promise<any> {
    if (this.audioStorageService.setTranslated(true, id)) {
      return res.status(200).json('Set translated successfull');
    } else {
      return res.status(500).json('Failed to set translated');
    }
  }
}
