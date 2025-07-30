import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './index.css';
import App from './App';
import { store, persistor } from './store/store';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <PersistGate loading={<LoadingSpinner />} persistor={persistor}>
          <QueryClientProvider client={queryClient}>
            <HelmetProvider>
              <BrowserRouter>
                <App />
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                  theme="light"
                />
              </BrowserRouter>
            </HelmetProvider>
            <ReactQueryDevtools initialIsOpen={false} />
          </QueryClientProvider>
        </PersistGate>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);