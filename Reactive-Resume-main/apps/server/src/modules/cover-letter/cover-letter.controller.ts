import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { CoverLetterService } from './cover-letter.service';

class GenerateCoverLetterDto {
  name: string;
  experience: string;
  jobDescription: string;
}

@Controller('cover-letter')
@ApiTags('Cover Letter')
export class CoverLetterController {
  constructor(private readonly coverLetterService: CoverLetterService) {}

  @Post('generate')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Generate a cover letter using AI' })
  async generateCoverLetter(@Body() dto: GenerateCoverLetterDto) {
    const content = await this.coverLetterService.generateCoverLetter(dto);
    return { content };
  }
}
