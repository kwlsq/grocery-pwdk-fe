class RedirectService {
  private static readonly REDIRECT_KEY = 'intended_redirect';

  static saveIntendedRedirect(path: string) {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(this.REDIRECT_KEY, path);
    }
  }

  static getIntendedRedirect(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem(this.REDIRECT_KEY);
    }
    return null;
  }

  static clearIntendedRedirect() {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(this.REDIRECT_KEY);
    }
  }

  static handlePostLoginRedirect(): string {
    const intendedPath = this.getIntendedRedirect();
    this.clearIntendedRedirect();
    
    return intendedPath || '/';
  }
}

export default RedirectService;