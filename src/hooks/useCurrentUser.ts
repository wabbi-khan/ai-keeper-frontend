'use client';

import { useState, useEffect } from 'react';
import { authService, AuthUserData } from '@/services/auth.service';

export interface CurrentUserHookResult {
  user: AuthUserData | null;
  slug: string;
  firmName: string;
  name: string;
  email: string;
  role: string;
  isLoaded: boolean;
}

/**
 * Hook to retrieve the currently authenticated user's profile and thesis slug.
 * Safely initializes on client mount to prevent hydration mismatch.
 */
export function useCurrentUser(): CurrentUserHookResult {
  const [user, setUser] = useState<AuthUserData | null>(null);
  const [slug, setSlug] = useState<string>('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const activeUser = authService.getCurrentUser();
    const activeSlug = authService.getThesisSlug() || activeUser?.slug || '';

    setUser(activeUser);
    setSlug(activeSlug);
    setIsLoaded(true);

    // Optional: listen for storage events to update in multi-tab sessions
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'dealflow_user' || e.key === 'dealflow_thesis_slug') {
        const updatedUser = authService.getCurrentUser();
        setUser(updatedUser);
        setSlug(authService.getThesisSlug() || updatedUser?.slug || '');
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return {
    user,
    slug,
    firmName: user?.firmName || 'Institutional Desk',
    name: user?.name || 'Managing Partner',
    email: user?.email || '',
    role: user?.role || 'Investment Partner',
    isLoaded,
  };
}

export default useCurrentUser;
