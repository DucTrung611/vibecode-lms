import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/app/layout/RootLayout';
import { HomePage } from '@/app/pages/HomePage';
import { chatRoutes } from '@/features/ai-chatbot';
import { analyticsRoutes } from '@/features/analytics';
import { assignmentRoutes } from '@/features/assignments';
import { certificateRoutes } from '@/features/certificates';
import { coursesRoutes } from '@/features/courses';
import { enrollmentRoutes } from '@/features/enrollment';
import { identityRoutes } from '@/features/identity';
import { learningPathRoutes } from '@/features/learning-paths';
import { notificationRoutes } from '@/features/notifications';
import { paymentRoutes } from '@/features/payments';
import { quizRoutes } from '@/features/quizzes';

// Feature routes are registered here as they're scaffolded by /fe-feature.
// Each feature exports its route objects from its `pages/` folder.
export const router = createBrowserRouter([
  {
    // Pathless layout route: contributes no path segment, so children below
    // keep their own absolute-looking paths unchanged while still rendering
    // inside <RootLayout>'s persistent <Header />.
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      ...identityRoutes,
      ...coursesRoutes,
      ...enrollmentRoutes,
      ...quizRoutes,
      ...assignmentRoutes,
      ...certificateRoutes,
      ...notificationRoutes,
      ...paymentRoutes,
      ...learningPathRoutes,
      ...chatRoutes,
      ...analyticsRoutes,
    ],
  },
]);
