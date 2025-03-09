import { lazy, Suspense, useEffect } from 'react';
import { Outlet, Navigate, useRoutes, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from '../../src/theme/styles';
// import { AuthLayout } from '../../src/layouts/auth';
import { DashboardLayout } from '../../src/layouts/dashboard';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from '../slices/authSlice';
import { AppDispatch, RootState  } from '../../src/redux/store';
// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('../../src/pages/home'));
export const BlogPage = lazy(() => import('../../src/pages/blog'));
export const UserPage = lazy(() => import('../../src/pages/user'));
export const SignInPage = lazy(() => import('../../src/pages/sign-in'));
export const Page404 = lazy(() => import('../../src/pages/page-not-found'));
export const Login = lazy(()=> import('../../src/components/Login'));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
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
    // Only fetch user data if we have a token but no user
    if (isAuthenticated && !user && !loading) {
      dispatch(getUserProfile() as any);
    }
  }, [isAuthenticated, user, loading, dispatch]);

  // Show loading state while checking authentication
  if (loading) {
    return renderFallback;
  }
  
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
        { path: 'blog', element: <BlogPage /> },
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
      path: '404',
      element: <Suspense fallback={renderFallback}><Page404 /></Suspense>,
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}



// export function Router() {
//   return useRoutes([
//     {
//       element: (
//         <DashboardLayout>
//           <Suspense fallback={renderFallback}>
//             <Outlet />
//           </Suspense>
//         </DashboardLayout>
//       ),
//       children: [
//         { element: <HomePage />, index: true },
//         { path: 'user', element: <UserPage /> },
//         { path: 'blog', element: <BlogPage /> },
//       ],
//     },
//     {
//       path: 'sign-in',
//       element: (
//         <AuthLayout>
//           <SignInPage />
//         </AuthLayout>
//       ),
//     },
//     {
//       path: '404',
//       element: <Page404 />,
//     },
//     {
//       path: '*',
//       element: <Navigate to="/404" replace />,
//     },
//   ]);
// }
