import { Link } from '@tanstack/react-router';
import styles from './NotFoundPage.module.css';

export function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>404</h1>
        <p className={styles.message}>Page not found</p>
        <Link to="/" className={styles.link}>
          Go to Map
        </Link>
      </div>
    </div>
  );
}
