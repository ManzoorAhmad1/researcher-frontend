class SessionStorageService {
  private ss: Storage | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.ss = window.sessionStorage;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (this.ss !== null) {
      const serializedValue = JSON.stringify(value);
      this.ss.setItem(key, serializedValue);
    }
  }

  getItem<T>(key: string): T | null {
    if (this.ss !== null) {
      const serializedValue = this.ss.getItem(key);
      if (serializedValue === null) {
        return null;
      }
      try {
        return JSON.parse(serializedValue) as T;
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  removeItem(key: string): void {
    if (this.ss !== null) {
      this.ss.removeItem(key);
    }
  }

  clear(): void {
    if (this.ss !== null) {
      this.ss.clear();
    }
  }

  key(index: number): string | null {
    if (this.ss !== null) {
      return this.ss.key(index);
    }
    return null;
  }

  get length(): number {
    if (this.ss !== null) {
      return this.ss.length;
    }
    return 0;
  }
}

const sessionStorageService = new SessionStorageService();

export default sessionStorageService;
