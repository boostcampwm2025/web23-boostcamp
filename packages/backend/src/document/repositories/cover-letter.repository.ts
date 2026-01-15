import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CoverLetter } from '../entities/cover-letter.entity';

@Injectable()
export class CoverLetterRepository extends Repository<CoverLetter> {
  constructor(dataSource: DataSource) {
    super(CoverLetter, dataSource.createEntityManager());
  }

  async findByDocumentId(documentId: string): Promise<CoverLetter | null> {
    return this.findOne({
      where: { document: { documentId } },
      relations: ['questionAnswers'],
    });
  }
}
