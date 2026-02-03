import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  private readonly clovaApiUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.clovaApiUrl = this.configService.get<string>('CLOVA_API_URL') || '';
  }

  async checkGoogle(): Promise<boolean> {
    try {
      const response = await fetch(
        'https://accounts.google.com/.well-known/openid-configuration',
        { method: 'HEAD' },
      );
      return response.ok;
    } catch (error) {
      this.logger.error('Google Health Check Failed', error);
      return false;
    }
  }

  async checkClova(): Promise<boolean> {
    const clovaApiKey = this.configService.get<string>('CLOVA_API_KEY');
    if (!this.clovaApiUrl || !clovaApiKey) {
      this.logger.warn('CLOVA_API_URL or CLOVA_API_KEY is not defined');
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      new URL(this.clovaApiUrl);

      const response = await fetch(this.clovaApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clovaApiKey}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'Hi' }],
          maxCompletionTokens: 1, // Minimize token usage
          topP: 0.1,
          topK: 0,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      this.logger.log(`Clova Health Check Status: ${response.status}`);

      // Even if it's 429 (Rate Limit) or 5xx, we might consider the service "reachable" but "unhealthy" or "down".
      // For simple UP/DOWN check, we demand 200 OK.
      return response.ok;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        return false;
      }
      this.logger.error('Clova Health Check Failed', error);
      return false;
    }
  }
}
