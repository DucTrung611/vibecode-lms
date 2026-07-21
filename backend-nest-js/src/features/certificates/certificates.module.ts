import { Module } from '@nestjs/common';
import { CertificatesController } from './controllers/certificates.controller';
import { CertificateRepository } from './repositories/certificate.repository';
import { CertificatesService } from './services/certificates.service';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificateRepository],
  exports: [CertificatesService],
})
export class CertificatesModule {}
