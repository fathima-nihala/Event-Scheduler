
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { Suspense, lazy } from 'react';
// import './App.css'
// import Footer from './shared/Footer';
// import Header from './shared/Header';


// const Login = lazy(() => import('./components/Login'));
// const Signup = lazy(() => import('./components/SignUp'));
// const Home = lazy(() => import('./components/Home'));

// function App() {

//   return (
//     <Router>
//       <Header />
//       <Suspense fallback={<></>}>
//         <Routes>
//           <Route path='/' element={<Login />} />
//           <Route path='/sign_up' element={<Signup />} />
//           <Route path='/home' element={<Home />} />
//         </Routes>
//       </Suspense>
//       <Footer />
//     </Router>
//   )
// }

// export default App

// import { BrowserRouter } from 'react-router-dom'; 


import '../src/global.css';
import Fab from '@mui/material/Fab';
import { Router } from '../src/routes/sections';
import { useScrollToTop } from '../src/hooks/use-scroll-to-top';
import { ThemeProvider } from '../src/theme/theme-provider';
import { Iconify } from '../src/components/iconify';

// ----------------------------------------------------------------------

export default function App() {
  useScrollToTop();

  const githubButton = (

    <Fab
      size="medium"
      aria-label="Github"
      href="https://github.com/fathima-nihala/Event-Scheduler"
      sx={{
        zIndex: 9,
        right: 20,
        bottom: 20,
        width: 44,
        height: 44,
        position: 'fixed',
        bgcolor: 'grey.800',
        color: 'common.white',
      }}
    >
      <Iconify width={24} icon="eva:github-fill" />
    </Fab>
  );

  return (
    <ThemeProvider>
      <Router />
      {githubButton}
    </ThemeProvider>
  );
}


