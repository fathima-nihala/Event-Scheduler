import './global.css';
import Fab from '@mui/material/Fab';
import { Router } from './routes/sections';
import { useScrollToTop } from './hooks/use-scroll-to-top';
import { ThemeProvider } from './theme/theme-provider';
import { Iconify } from './components/iconify';

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
