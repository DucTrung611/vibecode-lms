import type { Request } from 'express';
import { UploadsController } from '../controllers/uploads.controller';

describe('UploadsController', () => {
  let controller: UploadsController;

  beforeEach(() => {
    controller = new UploadsController();
  });

  function fakeRequest(): Request {
    return {
      protocol: 'http',
      get: (name: string) => (name === 'host' ? 'localhost:3000' : undefined),
    } as unknown as Request;
  }

  describe('upload', () => {
    it('returns the absolute URL of the stored file', () => {
      const file = { filename: 'abc123.png' } as Express.Multer.File;

      const result = controller.upload(file, fakeRequest());

      expect(result).toEqual({
        fileUrl: 'http://localhost:3000/uploads/abc123.png',
      });
    });

    it('throws UPLOAD_001 (400) when no file is provided', () => {
      expect(() =>
        controller.upload(undefined as never, fakeRequest()),
      ).toThrow(
        expect.objectContaining({
          httpStatus: 400,
          code: 'UPLOAD_001',
        }) as Error,
      );
    });
  });
});
