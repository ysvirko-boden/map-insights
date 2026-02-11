import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '../common/ThemeToggle/ThemeToggle';
import './Header.css';

export interface HeaderProps {
  className?: string;
}

export function Header({ className = '' }: HeaderProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    void (async () => {
      try {
        await signOut();
        navigate({ to: '/login' });
      } catch (error) {
        console.error('Sign out error:', error);
      }
    })();
  };

  return (
    <header className={`header ${className}`}>
      <h1>Map Insights</h1>
      <div className="header-actions">
        {user && (
          <div className="user-info">
            <span className="user-email">{user.email}</span>
            <button onClick={handleSignOut} className="sign-out-button" type="button">
              Sign Out
            </button>
          </div>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
