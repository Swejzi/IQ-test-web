import { useEffect, useCallback } from 'react';
import { useAppDispatch } from '@/store';
import { 
  trackMouseMovement, 
  trackKeystroke, 
  incrementTabSwitches, 
  setDevToolsOpened,
  incrementCopyPasteEvents,
  trackWindowFocus 
} from '@/store/slices/testSlice';

interface UseBehaviorTrackingOptions {
  enabled?: boolean;
  trackMouse?: boolean;
  trackKeyboard?: boolean;
  trackFocus?: boolean;
  trackCopyPaste?: boolean;
  trackDevTools?: boolean;
}

export const useBehaviorTracking = (options: UseBehaviorTrackingOptions = {}) => {
  const dispatch = useAppDispatch();
  
  const {
    enabled = true,
    trackMouse = true,
    trackKeyboard = true,
    trackFocus = true,
    trackCopyPaste = true,
    trackDevTools = true,
  } = options;

  // Mouse movement tracking
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!enabled || !trackMouse) return;
    
    dispatch(trackMouseMovement({
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
      type: 'move',
    }));
  }, [dispatch, enabled, trackMouse]);

  // Mouse click tracking
  const handleMouseClick = useCallback((event: MouseEvent) => {
    if (!enabled || !trackMouse) return;
    
    dispatch(trackMouseMovement({
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
      type: 'click',
    }));
  }, [dispatch, enabled, trackMouse]);

  // Keyboard tracking
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled || !trackKeyboard) return;
    
    dispatch(trackKeystroke({
      key: event.key,
      timestamp: Date.now(),
      type: 'keydown',
    }));

    // Track copy/paste events
    if (trackCopyPaste && (event.ctrlKey || event.metaKey)) {
      if (event.key === 'c' || event.key === 'v' || event.key === 'x') {
        dispatch(incrementCopyPasteEvents());
      }
    }

    // Track dev tools (F12, Ctrl+Shift+I, etc.)
    if (trackDevTools) {
      if (
        event.key === 'F12' ||
        (event.ctrlKey && event.shiftKey && event.key === 'I') ||
        (event.ctrlKey && event.shiftKey && event.key === 'J') ||
        (event.ctrlKey && event.key === 'U')
      ) {
        dispatch(setDevToolsOpened(true));
      }
    }
  }, [dispatch, enabled, trackKeyboard, trackCopyPaste, trackDevTools]);

  // Window focus tracking
  const handleFocus = useCallback(() => {
    if (!enabled || !trackFocus) return;
    
    dispatch(trackWindowFocus({
      type: 'focus',
      timestamp: Date.now(),
    }));
  }, [dispatch, enabled, trackFocus]);

  const handleBlur = useCallback(() => {
    if (!enabled || !trackFocus) return;
    
    dispatch(trackWindowFocus({
      type: 'blur',
      timestamp: Date.now(),
    }));
    
    // Track tab switches
    dispatch(incrementTabSwitches());
  }, [dispatch, enabled, trackFocus]);

  // Visibility change tracking
  const handleVisibilityChange = useCallback(() => {
    if (!enabled || !trackFocus) return;
    
    if (document.hidden) {
      dispatch(incrementTabSwitches());
      dispatch(trackWindowFocus({
        type: 'blur',
        timestamp: Date.now(),
      }));
    } else {
      dispatch(trackWindowFocus({
        type: 'focus',
        timestamp: Date.now(),
      }));
    }
  }, [dispatch, enabled, trackFocus]);

  // Context menu tracking (right-click)
  const handleContextMenu = useCallback((event: MouseEvent) => {
    if (!enabled) return;
    
    // Prevent right-click during test
    event.preventDefault();
    
    dispatch(trackMouseMovement({
      x: event.clientX,
      y: event.clientY,
      timestamp: Date.now(),
      type: 'click',
    }));
  }, [dispatch, enabled]);

  // Dev tools detection
  const detectDevTools = useCallback(() => {
    if (!enabled || !trackDevTools) return;
    
    const threshold = 160;
    
    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        dispatch(setDevToolsOpened(true));
      }
    }, 500);
  }, [dispatch, enabled, trackDevTools]);

  // Scroll tracking
  const handleScroll = useCallback((event: Event) => {
    if (!enabled || !trackMouse) return;
    
    dispatch(trackMouseMovement({
      x: window.scrollX,
      y: window.scrollY,
      timestamp: Date.now(),
      type: 'scroll',
    }));
  }, [dispatch, enabled, trackMouse]);

  useEffect(() => {
    if (!enabled) return;

    // Add event listeners
    if (trackMouse) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('click', handleMouseClick);
      document.addEventListener('contextmenu', handleContextMenu);
      document.addEventListener('scroll', handleScroll, { passive: true });
    }

    if (trackKeyboard) {
      document.addEventListener('keydown', handleKeyDown);
    }

    if (trackFocus) {
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (trackDevTools) {
      detectDevTools();
    }

    // Cleanup
    return () => {
      if (trackMouse) {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('click', handleMouseClick);
        document.removeEventListener('contextmenu', handleContextMenu);
        document.removeEventListener('scroll', handleScroll);
      }

      if (trackKeyboard) {
        document.removeEventListener('keydown', handleKeyDown);
      }

      if (trackFocus) {
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [
    enabled,
    trackMouse,
    trackKeyboard,
    trackFocus,
    trackDevTools,
    handleMouseMove,
    handleMouseClick,
    handleKeyDown,
    handleFocus,
    handleBlur,
    handleVisibilityChange,
    handleContextMenu,
    handleScroll,
    detectDevTools,
  ]);

  return {
    enabled,
    trackMouse,
    trackKeyboard,
    trackFocus,
    trackCopyPaste,
    trackDevTools,
  };
};

export default useBehaviorTracking;
