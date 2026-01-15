import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PortfolioRepository } from './repositories/portfolio.repository';
import { CoverLetterRepository } from './repositories/cover-letter.repository';
import { DocumentRepository } from './repositories/document.repository';

@Module({
  controllers: [DocumentController],
  providers: [
    DocumentService,
    PortfolioRepository,
    CoverLetterRepository,
    DocumentRepository,
  ],
  exports: [PortfolioRepository, CoverLetterRepository, DocumentRepository],
})
export class DocumentModule {}
