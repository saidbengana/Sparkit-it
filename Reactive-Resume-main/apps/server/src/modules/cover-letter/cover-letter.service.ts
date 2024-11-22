import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RateLimiterMemory } from 'rate-limiter-flexible';

interface GenerateCoverLetterParams {
  name: string;
  experience: string;
  jobDescription: string;
}

@Injectable()
export class CoverLetterService {
  private readonly cloudflareAccountId: string;
  private readonly cloudflareApiToken: string;
  private readonly cloudflareModelId = '@cf/meta/llama-2-7b-chat-int8';
  private readonly rateLimiter: RateLimiterMemory;

  constructor(private readonly configService: ConfigService) {
    this.cloudflareAccountId = this.configService.get<string>('CLOUDFLARE_ACCOUNT_ID');
    this.cloudflareApiToken = this.configService.get<string>('CLOUDFLARE_API_TOKEN');
    
    // Allow 5 requests per user per minute
    this.rateLimiter = new RateLimiterMemory({
      points: 5,
      duration: 60,
    });
  }

  async generateCoverLetter({
    name,
    experience,
    jobDescription,
  }: GenerateCoverLetterParams): Promise<string> {
    try {
      // Check rate limit
      await this.rateLimiter.consume(name, 1);

      if (!this.cloudflareAccountId || !this.cloudflareApiToken) {
        throw new Error('Cloudflare credentials are not configured');
      }

      const prompt = `
        Write a professional cover letter for a job application with the following details:

        Applicant Name: ${name}
        Applicant Experience and Skills: ${experience}
        Job Description: ${jobDescription}

        Please follow these guidelines:
        1. Use a professional and engaging tone
        2. Highlight relevant experience and skills that match the job requirements
        3. Show enthusiasm for the role and company
        4. Keep it concise and well-structured
        5. Include a strong closing statement
        6. Format it as a proper business letter with paragraphs

        Do not include the date or addresses, just the content of the letter.
      `;

      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${this.cloudflareAccountId}/ai/run/${this.cloudflareModelId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.cloudflareApiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Cloudflare API error: ${error.errors?.[0]?.message || 'Unknown error'}`);
      }

      const result = await response.json();
      return result.result.response;
    } catch (error) {
      if (error.name === 'RateLimiterRes') {
        throw new HttpException(
          'Too many requests. Please try again later.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      console.error('Error generating cover letter:', error);
      throw new Error(
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while generating the cover letter'
      );
    }
  }
}
