import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import configuration, { configValidationSchema } from './config/configuration';
import { CoreModule } from './core/core.module';
import { AssignmentsModule } from './features/assignments/assignments.module';
import { CertificatesModule } from './features/certificates/certificates.module';
import { CoursesModule } from './features/courses/courses.module';
import { EnrollmentModule } from './features/enrollment/enrollment.module';
import { IdentityModule } from './features/identity/identity.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { PaymentsModule } from './features/payments/payments.module';
import { QuizzesModule } from './features/quizzes/quizzes.module';
import { ReviewsModule } from './features/reviews/reviews.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: configValidationSchema,
      validationOptions: { abortEarly: false },
    }),
    EventEmitterModule.forRoot(),
    CoreModule,
    IdentityModule,
    CoursesModule,
    EnrollmentModule,
    QuizzesModule,
    AssignmentsModule,
    CertificatesModule,
    ReviewsModule,
    NotificationsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
