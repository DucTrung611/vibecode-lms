import { createBrowserRouter } from 'react-router-dom';
import { chatRoutes } from '@/features/ai-chatbot';
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
    path: '/',
    element: <div className="p-8 text-center text-gray-500">Coming soon</div>,
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
]);
