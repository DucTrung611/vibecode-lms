import { createBrowserRouter } from 'react-router-dom';

// Feature routes are registered here as they're scaffolded by /fe-feature.
// Each feature exports its route objects from its `pages/` folder.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <div className="p-8 text-center text-gray-500">Coming soon</div>,
  },
]);
