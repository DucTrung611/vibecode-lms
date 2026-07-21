import { createBrowserRouter } from 'react-router-dom';
import { coursesRoutes } from '@/features/courses';
import { enrollmentRoutes } from '@/features/enrollment';
import { identityRoutes } from '@/features/identity';

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
]);
