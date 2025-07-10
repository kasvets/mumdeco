import { useEffect } from 'react';

interface UseBodyScrollLockOptions {
  isLocked: boolean;
  onEscape?: () => void;
}

export const useBodyScrollLock = ({ isLocked, onEscape }: UseBodyScrollLockOptions) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    if (isLocked) {
      // Store original body overflow
      const originalStyle = window.getComputedStyle(document.body).overflow;
      
      // Lock body scroll
      document.body.style.overflow = 'hidden';
      
      // Add escape key listener if provided
      if (onEscape) {
        document.addEventListener('keydown', handleKeyDown);
      }

      return () => {
        // Restore original body overflow
        document.body.style.overflow = originalStyle;
        
        // Remove escape key listener
        if (onEscape) {
          document.removeEventListener('keydown', handleKeyDown);
        }
      };
    } else {
      // Ensure body overflow is restored when not locked
      document.body.style.overflow = 'unset';
    }
  }, [isLocked, onEscape]);
};

// Enhanced version with additional mobile scroll prevention
export const useBodyScrollLockEnhanced = ({ isLocked, onEscape }: UseBodyScrollLockOptions) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onEscape) {
        onEscape();
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      // Prevent touch scrolling on mobile devices
      if (isLocked) {
        event.preventDefault();
      }
    };

    if (isLocked) {
      // Store original values
      const originalStyle = window.getComputedStyle(document.body).overflow;
      const originalPosition = window.getComputedStyle(document.body).position;
      
      // Lock body scroll for desktop
      document.body.style.overflow = 'hidden';
      
      // Additional mobile scroll prevention
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
      
      // Add event listeners
      if (onEscape) {
        document.addEventListener('keydown', handleKeyDown);
      }
      document.addEventListener('touchmove', handleTouchMove, { passive: false });

      return () => {
        // Restore original styles
        document.body.style.overflow = originalStyle;
        document.body.style.position = originalPosition;
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        
        // Remove event listeners
        if (onEscape) {
          document.removeEventListener('keydown', handleKeyDown);
        }
        document.removeEventListener('touchmove', handleTouchMove);
      };
    } else {
      // Ensure body is unlocked when not locked
      document.body.style.overflow = 'unset';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
    }
  }, [isLocked, onEscape]);
};

export default useBodyScrollLock; 