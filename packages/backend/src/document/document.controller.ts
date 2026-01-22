import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreatePortfolioTextRequestDto } from './dto/create-portfolio-text-request.dto';
import { CreatePortfolioTextResponseDto } from './dto/create-portfolio-text-response.dto';
import { ViewPortfolioResponseDto } from './dto/view-portfolio-response.dto';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('portfolio/create')
  async createPortfolioWithText(
    @Body() body: CreatePortfolioTextRequestDto,
  ): Promise<CreatePortfolioTextResponseDto> {
    const userId = '1';
    return await this.documentService.createPortfolioWithText(
      userId,
      body.title,
      body.content,
    );
  }

  @Get(':documentId/portfolio')
  async viewPortfolio(
    @Param('documentId') documentId: string,
  ): Promise<ViewPortfolioResponseDto> {
    const userId = '1';
    return await this.documentService.viewPortfolio(userId, documentId);
  }
}
