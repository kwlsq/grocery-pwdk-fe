// src/services/redirectService.ts
class RedirectService {
  private static readonly REDIRECT_KEY = 'intended_redirect';
  private static readonly DEFAULT_REDIRECT = '/';

  /**
   * Store the intended redirect URL
   */
  static setIntendedRedirect(path: string): void {
    if (typeof window !== 'undefined') {
      // Don't store auth-related paths as redirect targets
      const authPaths = ['/auth', '/verify', '/reset-password', '/forgot-password', '/fallback'];
      const isAuthPath = authPaths.some(authPath => path.startsWith(authPath));
      
      if (!isAuthPath && path !== '/') {
        localStorage.setItem(this.REDIRECT_KEY, path);
        console.log('Stored redirect path:', path); // Debug log
      }
    }
  }

  /**
   * Get stored redirect without clearing it
   */
  static getStoredRedirect(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.REDIRECT_KEY);
    }
    return null;
  }

  /**
   * Get and clear the intended redirect URL
   */
  static getAndClearIntendedRedirect(): string {
    if (typeof window !== 'undefined') {
      const redirect = localStorage.getItem(this.REDIRECT_KEY);
      if (redirect) {
        localStorage.removeItem(this.REDIRECT_KEY);
        console.log('Retrieved and cleared redirect path:', redirect); // Debug log
        return redirect;
      }
    }
    return this.DEFAULT_REDIRECT;
  }

  /**
   * Handle post-login redirect
   */
  static handlePostLoginRedirect(): string {
    return this.getAndClearIntendedRedirect();
  }

  /**
   * Clear any stored redirects
   */
  static clearIntendedRedirect(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.REDIRECT_KEY);
      console.log('Cleared stored redirect'); // Debug log
    }
  }
}

export default RedirectService;