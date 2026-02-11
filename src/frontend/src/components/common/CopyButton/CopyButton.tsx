/**
 * CopyButton component
 * Icon button that copies text to clipboard with visual feedback
 */

import { useState } from 'react';
import './CopyButton.css';

export interface CopyButtonProps {
  textToCopy: string;
  ariaLabel?: string;
}

export function CopyButton({ textToCopy, ariaLabel = 'Copy to clipboard' }: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  return (
    <button
      className={`copy-button ${isCopied ? 'copy-button-copied' : ''}`}
      onClick={(e) => void handleCopy(e)}
      aria-label={isCopied ? 'Copied!' : ariaLabel}
      title={isCopied ? 'Copied!' : 'Copy'}
      type="button"
    >
      {isCopied ? (
        <svg
          className="copy-button-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      ) : (
        <svg
          className="copy-button-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
          <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
        </svg>
      )}
    </button>
  );
}
