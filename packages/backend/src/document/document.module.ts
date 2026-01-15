import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { PortfolioRepository } from './repositories/portfolio.repository';
import { CoverLetterRepository } from './repositories/cover-letter.repository';

@Module({
  controllers: [DocumentController],
  providers: [DocumentService, PortfolioRepository, CoverLetterRepository],
  exports: [PortfolioRepository, CoverLetterRepository],
})
export class DocumentModule {}
