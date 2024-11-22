import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CoverLetterController } from './cover-letter.controller';
import { CoverLetterService } from './cover-letter.service';

@Module({
  imports: [ConfigModule],
  controllers: [CoverLetterController],
  providers: [CoverLetterService],
})
export class CoverLetterModule {}
