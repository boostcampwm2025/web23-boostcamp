import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Patch,
  Query,
} from '@nestjs/common';

import { DocumentService } from './document.service';
import { CreatePortfolioTextRequestDto } from './dto/create-portfolio-text-request.dto';
import { CreatePortfolioTextResponseDto } from './dto/create-portfolio-text-response.dto';
import { PortfolioDetailResponseDto } from './dto/portfolio-detail-response.dto';
import { UpdatePortfolioRequestDto } from `./dto/update-portfolio-request.dto`;
import { DocumentSummaryListResponse } from './dto/document-summary.response.dto';
import { DocumentSummaryRequest } from './dto/document-summary.request.dto';
import { CreateCoverLetterRequestDto } from './dto/create-cover-letter-request.dto';
import { CreateCoverLetterResponseDto } from './dto/create-cover-letter-response.dto';
import { UpdateCoverLetterRequestDto } from './dto/update-cover-letter-request.dto';
import { CoverLetterDetailResponseDto } from './dto/cover-letter-detail-response.dto';

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
  ): Promise<PortfolioDetailResponseDto> {
    const userId = '1';
    return await this.documentService.viewPortfolio(userId, documentId);
  }

  @Patch(':documentId/portfolio')
  async updatePortfolio(
    @Param('documentId') documentId: string,
    @Body() body: UpdatePortfolioRequestDto,
  ): Promise<PortfolioDetailResponseDto> {
    const userId = '1';
    return await this.documentService.updatePortfolio(
      userId,
      documentId,
      body.title,
      body.content,
    );
  }

  @Delete(':documentId/portfolio')
  @HttpCode(204)
  async deletePortfolio(@Param('documentId') documentId: string) {
    const userId = '1';
    await this.documentService.deletePortfolio(userId, documentId);
  }

  @Post('cover-letter/create')
  async createCoverLetter(
    @Body() body: CreateCoverLetterRequestDto,
  ): Promise<CreateCoverLetterResponseDto> {
    const userId = '1';
    return await this.documentService.createCoverLetter(
      userId,
      body.title,
      body.content,
    );
  }

  @Get(':documentId/cover-letter')
  async viewCoverLetter(
    @Param('documentId') documentId: string,
  ): Promise<CoverLetterDetailResponseDto> {
    const userId = '1';
    return await this.documentService.viewCoverLetter(userId, documentId);
  }

  @Delete(':documentId/cover-letter')
  @HttpCode(204)
  async deleteCoverLetter(@Param('documentId') documentId: string) {
    const userId = '1';
    await this.documentService.deleteCoverLetter(userId, documentId);
  }

  @Put(':documentId/cover-letter')
  async updateCoverLetter(
    @Param('documentId') documentId: string,
    @Body() body: UpdateCoverLetterRequestDto,
  ): Promise<CoverLetterDetailResponseDto> {
    const userId = '1';
    return await this.documentService.updateCoverLetter(
      userId,
      documentId,
      body,
    );
  }

  @Get()
  async getDocumentList(
    @Query() dto: DocumentSummaryRequest,
  ): Promise<DocumentSummaryListResponse> {
    const userId = '1';

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