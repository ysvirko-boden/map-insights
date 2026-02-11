import { RouterProvider } from '@tanstack/react-router';
import { APIProvider } from '@vis.gl/react-google-maps';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { router } from './router';
import './App.css';

function App() {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div style={{ padding: '2rem', color: 'red' }}>
        <h1>Configuration Error</h1>
        <p>Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in .env.local</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <APIProvider apiKey={apiKey} libraries={['places']}>
          <RouterProvider router={router} />
        </APIProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
