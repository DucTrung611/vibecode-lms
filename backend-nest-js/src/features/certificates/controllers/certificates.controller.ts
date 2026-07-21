import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../shared/decorators/current-user.decorator';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { QueryCertificatesDto } from '../dto/query-certificates.dto';
import { CertificatesService } from '../services/certificates.service';

@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  findMine(
    @CurrentUser('id') studentId: string,
    @Query() query: QueryCertificatesDto,
  ) {
    return this.certificatesService.findMyCertificates(
      studentId,
      query.page,
      query.limit,
    );
  }

  @Get(':code/verify')
  verify(@Param('code') code: string) {
    return this.certificatesService.verifyByCode(code);
  }
}
