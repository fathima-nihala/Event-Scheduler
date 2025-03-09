import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { Provider } from 'react-redux'
import store from './redux/store.ts'
import { SnackbarProvider } from 'notistack';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
    <BrowserRouter>
    <Provider store={store}>
    <SnackbarProvider autoHideDuration={2000} preventDuplicate dense >
      <App />
      </SnackbarProvider>
    </Provider>
    </BrowserRouter>
    </HelmetProvider>
  </StrictMode>,
)
