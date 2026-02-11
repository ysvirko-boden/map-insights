import './Header.css';
import './Footer.css';
import './Sidebar.css';
import './AppLayout.css';
import { Header } from './Header';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

export interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="app-layout">
      <Header />
      <div className="app-main">
        <main className="app-content">{children}</main>
        <Sidebar />
      </div>
      <Footer />
    </div>
  );
}
