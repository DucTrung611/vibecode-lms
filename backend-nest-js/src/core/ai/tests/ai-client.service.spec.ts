import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../../config/configuration';
import { AiClientService } from '../ai-client.service';

describe('AiClientService', () => {
  let service: AiClientService;
  let configService: jest.Mocked<Pick<ConfigService<AppConfig, true>, 'get'>>;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    configService = { get: jest.fn() };
    service = new AiClientService(
      configService as unknown as ConfigService<AppConfig, true>,
    );
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });

  describe('isConfigured', () => {
    it('returns false when apiKey or baseUrl is empty', () => {
      configService.get.mockReturnValue({
        apiKey: '',
        baseUrl: '',
        model: 'gpt-4o-mini',
      });

      expect(service.isConfigured()).toBe(false);
    });

    it('returns true when both apiKey and baseUrl are set', () => {
      configService.get.mockReturnValue({
        apiKey: 'sk-test',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
      });

      expect(service.isConfigured()).toBe(true);
    });
  });

  describe('complete', () => {
    it('throws AI_001 (503) when not configured', async () => {
      configService.get.mockReturnValue({
        apiKey: '',
        baseUrl: '',
        model: 'gpt-4o-mini',
      });

      await expect(
        service.complete([{ role: 'user', content: 'hi' }]),
      ).rejects.toMatchObject({ httpStatus: 503, code: 'AI_001' });
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('posts messages to <baseUrl>/chat/completions and returns the content', async () => {
      configService.get.mockReturnValue({
        apiKey: 'sk-test',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
      });
      fetchMock.mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            choices: [{ message: { content: 'Hello there' } }],
          }),
      });

      const result = await service.complete([{ role: 'user', content: 'hi' }]);

      expect(fetchMock).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            Authorization: 'Bearer sk-test',
          }) as unknown,
        }),
      );
      expect(result).toBe('Hello there');
    });

    it('throws AI_002 (502) when the provider responds with a non-ok status', async () => {
      configService.get.mockReturnValue({
        apiKey: 'sk-test',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
      });
      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        text: () => Promise.resolve('unauthorized'),
      });

      await expect(
        service.complete([{ role: 'user', content: 'hi' }]),
      ).rejects.toMatchObject({ httpStatus: 502, code: 'AI_002' });
    });

    it('throws AI_002 (502) when the request itself fails (network error)', async () => {
      configService.get.mockReturnValue({
        apiKey: 'sk-test',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
      });
      fetchMock.mockRejectedValue(new Error('ECONNREFUSED'));

      await expect(
        service.complete([{ role: 'user', content: 'hi' }]),
      ).rejects.toMatchObject({ httpStatus: 502, code: 'AI_002' });
    });

    it('throws AI_002 (502) when the response has no message content', async () => {
      configService.get.mockReturnValue({
        apiKey: 'sk-test',
        baseUrl: 'https://api.openai.com/v1',
        model: 'gpt-4o-mini',
      });
      fetchMock.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ choices: [] }),
      });

      await expect(
        service.complete([{ role: 'user', content: 'hi' }]),
      ).rejects.toMatchObject({ httpStatus: 502, code: 'AI_002' });
    });
  });
});
