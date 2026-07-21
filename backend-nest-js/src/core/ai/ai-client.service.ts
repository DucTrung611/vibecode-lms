import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
import { ApiException } from '../../shared/types/api-error-code.type';

export interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionResponse {
  choices?: { message?: { content?: string } }[];
}

/**
 * Thin wrapper over an OpenAI-compatible /chat/completions endpoint.
 * Configured entirely via AI_PROVIDER_API_KEY/AI_PROVIDER_BASE_URL/
 * AI_PROVIDER_MODEL (see configuration.ts) — no provider is hardcoded.
 */
@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);

  constructor(private readonly configService: ConfigService<AppConfig, true>) {}

  isConfigured(): boolean {
    const { apiKey, baseUrl } = this.configService.get('ai', { infer: true });
    return Boolean(apiKey && baseUrl);
  }

  async complete(messages: ChatCompletionMessage[]): Promise<string> {
    const { apiKey, baseUrl, model } = this.configService.get('ai', {
      infer: true,
    });

    if (!apiKey || !baseUrl) {
      throw new ApiException(503, 'AI_001', 'AI provider is not configured');
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages }),
      });
    } catch (error) {
      this.logger.error(
        'AI provider request failed to send',
        error instanceof Error ? error.stack : String(error),
      );
      throw new ApiException(502, 'AI_002', 'Could not reach AI provider');
    }

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`AI provider returned ${response.status}: ${body}`);
      throw new ApiException(502, 'AI_002', 'AI provider request failed');
    }

    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new ApiException(
        502,
        'AI_002',
        'AI provider returned an empty response',
      );
    }
    return content;
  }
}
