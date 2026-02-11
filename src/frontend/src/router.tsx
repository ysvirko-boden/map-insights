import { createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { LoginPage } from './pages/LoginPage';
import { MapPage } from './pages/MapPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { auth } from './lib/firebase';

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
  notFoundComponent: NotFoundPage,
});

// Login route (public)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
  beforeLoad: async () => {
    // If already authenticated, redirect to home
    const user = auth.currentUser;
    if (user) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/' });
    }
  },
});

// Map route (protected)
const mapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: MapPage,
  beforeLoad: async () => {
    // Wait for auth to initialize
    await new Promise<void>((resolve) => {
      const unsubscribe = auth.onAuthStateChanged(() => {
        unsubscribe();
        resolve();
      });
    });

    // If not authenticated, redirect to login
    const user = auth.currentUser;
    if (!user) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error
      throw redirect({ to: '/login' });
    }
  },
});

// Create route tree
const routeTree = rootRoute.addChildren([loginRoute, mapRoute]);

// Create router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
