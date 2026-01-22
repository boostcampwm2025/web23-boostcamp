import {Body, Controller, Get, Param, Post, Query} from '@nestjs/common';
import { DocumentService } from './document.service';
import { CreatePortfolioTextRequestDto } from './dto/create-portfolio-text-request.dto';
import { CreatePortfolioTextResponseDto } from './dto/create-portfolio-text-response.dto';
import { ViewPortfolioResponseDto } from './dto/view-portfolio-response.dto';
import {DocumentSummaryListResponse} from "./dto/document-summary.response.dto";
import {DocumentSummaryRequest} from "./dto/document-summary.request.dto";

@Controller('document')
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
  @Get()
  async getDocumentList(
      @Query() dto: DocumentSummaryRequest,
  ): Promise<DocumentSummaryListResponse> {
    const userId = '1';
    // 프론트의 페이지 시작은 1이지만 백엔드에선 0부터이다. 이를 맞추기 위해 1 빼준다.
    dto.page = Math.max(0, dto.page - 1);
    const { page, take, type, sort } = dto;
    return await this.documentService.listDocuments(
        userId,
        page,
        take,
        type,
        sort,
    );
  }
}
