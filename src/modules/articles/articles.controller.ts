import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateArticleDto } from './dto/create-article.dto';
import { ArticlesService } from './articles.service';
import { Article } from './article.entity';
import { AdminSecretGuard } from '../auth/adminsecret-auth.guard';

@Controller('articles')
@ApiTags('Articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @UseGuards(AdminSecretGuard)
  @ApiCreatedResponse({ description: 'Created', type: Article })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  async insertOne(
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<Article> {
    return this.articlesService.create(createArticleDto);
  }

  @Get()
  @ApiOkResponse({
    description: 'All existing articles',
    type: [Article],
  })
  @ApiBadRequestResponse({ description: 'Bad Request' })
  findAll(): Promise<Article[]> {
    return this.articlesService.findAll();
  }
}
