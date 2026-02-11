import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from './LoginPage';
import { AuthProvider } from '@/contexts/AuthContext';
import * as firebaseAuth from 'firebase/auth';

// Mock navigate function
const mockNavigate = vi.fn();
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

function renderLoginPage() {
  return render(
    <AuthProvider>
      <LoginPage />
    </AuthProvider>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in form by default', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: /map insights/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in$/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
  });

  it('switches between sign in and sign up tabs', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    // Initially on Sign In tab
    const signInTab = screen.getByRole('button', { name: /^sign in$/i });
    const signUpTab = screen.getByRole('button', { name: /^sign up$/i });

    // Click Sign Up tab
    await user.click(signUpTab);
    expect(screen.getByRole('button', { name: /^sign up$/i })).toBeInTheDocument();

    // Click back to Sign In tab
    await user.click(signInTab);
    expect(screen.getByRole('button', { name: /^sign in$/i })).toBeInTheDocument();
  });

  it('validates email field is required', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    // Try to submit with empty email
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(emailInput).toBeInvalid();
  });

  it('validates password field is required', async () => {
    const user = userEvent.setup();
    renderLoginPage();

    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    // Try to submit with empty password
    await user.click(submitButton);

    // HTML5 validation should prevent submission
    expect(passwordInput).toBeInvalid();
  });

  it('calls signInWithEmail on sign in submission', async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.mocked(firebaseAuth.signInWithEmailAndPassword);
    mockSignIn.mockResolvedValue({ 
      user: { email: 'test@example.com', uid: 'test-uid' } 
    } as unknown as firebaseAuth.UserCredential);

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalled();
    });
  });

  it('calls signUpWithEmail on sign up submission', async () => {
    const user = userEvent.setup();
    const mockSignUp = vi.mocked(firebaseAuth.createUserWithEmailAndPassword);
    mockSignUp.mockResolvedValue({ 
      user: { email: 'test@example.com', uid: 'test-uid' } 
    } as unknown as firebaseAuth.UserCredential);

    renderLoginPage();

    // Switch to Sign Up tab
    const signUpTab = screen.getByRole('button', { name: /^sign up$/i });
    await user.click(signUpTab);

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign up$/i });

    await user.type(emailInput, 'newuser@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalled();
    });
  });

  it('calls signInWithGoogle on Google button click', async () => {
    const user = userEvent.setup();
    const mockGoogleSignIn = vi.mocked(firebaseAuth.signInWithPopup);
    mockGoogleSignIn.mockResolvedValue({ 
      user: { email: 'test@example.com', uid: 'test-uid' } 
    } as unknown as firebaseAuth.UserCredential);

    renderLoginPage();

    const googleButton = screen.getByRole('button', { name: /continue with google/i });
    await user.click(googleButton);

    await waitFor(() => {
      expect(mockGoogleSignIn).toHaveBeenCalled();
    });
  });

  it('navigates to home page on successful authentication', async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.mocked(firebaseAuth.signInWithEmailAndPassword);
    mockSignIn.mockResolvedValue({ 
      user: { email: 'test@example.com', uid: 'test-uid' } 
    } as unknown as firebaseAuth.UserCredential);

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/' });
    });
  });

  it('shows loading state during authentication', async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.mocked(firebaseAuth.signInWithEmailAndPassword);
    
    // Make it take time to resolve
    mockSignIn.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        user: { email: 'test@example.com', uid: 'test-uid' } 
      } as unknown as firebaseAuth.UserCredential), 100))
    );

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Should show loading text
    expect(await screen.findByText(/loading\.\.\./i)).toBeInTheDocument();

    // Wait for completion
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  it('disables form during submission', async () => {
    const user = userEvent.setup();
    const mockSignIn = vi.mocked(firebaseAuth.signInWithEmailAndPassword);
    
    mockSignIn.mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ 
        user: { email: 'test@example.com', uid: 'test-uid' } 
      } as unknown as firebaseAuth.UserCredential), 100))
    );

    renderLoginPage();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const submitButton = screen.getByRole('button', { name: /^sign in$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    // Form fields should be disabled
    expect(emailInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });
});
