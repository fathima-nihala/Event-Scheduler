import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Navigate, useRoutes, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';
import { alpha } from '@mui/material/styles';


import { DashboardLayout } from '../layouts/dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from '../slices/authSlice';
import { AppDispatch, RootState } from '../redux/store';
import SignUp from '../components/SignUp';
// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('../pages/home'));
export const BlogPage = lazy(() => import('../pages/tasks'));
export const UserPage = lazy(() => import('../pages/user'));
export const SignInPage = lazy(() => import('../pages/sign-in'));
export const Page404 = lazy(() => import('../pages/page-not-found'));
export const Login = lazy(() => import('../components/Login'));
export const Event = lazy(() => import('../sections/event/event'))

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

//neew code
const ProtectedRoute = () => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  // Check for token immediately
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;

  useEffect(() => {
    if (isAuthenticated && !user && !loading) {
      dispatch(getUserProfile());
    }
  }, [isAuthenticated, user, loading, dispatch]);

  // Show loading state while checking authentication
  // if (loading) {
  //   return renderFallback;
  // }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log("No token found, redirecting to sign-in"); // Debug log
    return <Navigate to="/sign-in" state={{ from: location }} replace />;
  }

  // If we're authenticated but still loading user data, show loading
  if (isAuthenticated && !user) {
    return renderFallback;
  }

  return (
    <DashboardLayout>
      <Suspense fallback={renderFallback}>
        <Outlet />
      </Suspense>
    </DashboardLayout>
  );
};


export function Router() {
  return useRoutes([
    {
      element: <ProtectedRoute />,
      children: [
        { element: <HomePage />, index: true },
        { path: 'user', element: <UserPage /> },
        { path: 'tasks', element: <BlogPage /> },
        { path: 'events', element: <Event /> },

      ],
    },
    {
      path: 'sign-in',
      element: (
        <Suspense fallback={renderFallback}>
          <Login />
        </Suspense>
      ),
    },
    {
      path: 'sign-up',
      element: (
        <Suspense fallback={renderFallback}>
          <SignUp />
        </Suspense>
      ),
    },
    {
      path: '404',
      element: <Suspense fallback={renderFallback}><Page404 /></Suspense>,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}

