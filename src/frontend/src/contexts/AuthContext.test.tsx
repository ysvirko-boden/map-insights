import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import * as firebaseAuth from 'firebase/auth';

// Test component to access auth context
function TestComponent() {
  const { user, loading, error } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not-loading'}</div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleError.mockRestore();
  });

  it('provides auth context to children', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    expect(screen.getByTestId('user')).toHaveTextContent('no-user');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  it('sets loading to true initially', () => {
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, _callback) => {
      // Don't call callback immediately
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');
  });

  it('sets loading to false after auth state resolved', async () => {
    // @ts-expect-error - Mocking Firebase onAuthStateChanged callback
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback: (user: any) => void) => {
      setTimeout(() => callback(null), 0);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not-loading');
    });
  });

  it('sets user when authenticated', async () => {
    const mockUser = { email: 'test@example.com', uid: 'test-uid' } as firebaseAuth.User;
    
    // @ts-expect-error - Mocking Firebase onAuthStateChanged callback
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, callback: (user: any) => void) => {
      setTimeout(() => callback(mockUser), 0);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
  });

  it('handles auth state change errors', async () => {
    const mockError = new Error('Auth error');
    
    vi.mocked(firebaseAuth.onAuthStateChanged).mockImplementation((_auth, _callback: any, errorCallback?: (error: Error) => void) => {
      setTimeout(() => errorCallback?.(mockError), 0);
      return vi.fn();
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Auth error');
    });
  });
});
