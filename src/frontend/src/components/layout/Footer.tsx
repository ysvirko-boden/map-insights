export interface FooterProps {
  className?: string;
}

export function Footer({ className = '' }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`footer ${className}`}>
      <p>&copy; {currentYear} Map Insights. All rights reserved.</p>
    </footer>
  );
}
