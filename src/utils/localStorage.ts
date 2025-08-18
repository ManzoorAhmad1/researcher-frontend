class LocalStorageService {
  private ls: Storage | null = null; // Initialize ls with null

  constructor() {
    if (typeof window !== "undefined") {
      this.ls = window.localStorage;
    }
  }

  setItem<T>(key: string, value: T): void {
    if (this.ls !== null) {
      const serializedValue = JSON.stringify(value);
      this.ls.setItem(key, serializedValue);
    }
  }

  getItem<T>(key: string): T | null {
    if (this.ls !== null) {
      const serializedValue = this.ls.getItem(key);
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
    if (this.ls !== null) {
      this.ls.removeItem(key);
    }
  }

  clear(): void {
    if (this.ls !== null) {
      this.ls.clear();
    }
  }

  key(index: number): string | null {
    if (this.ls !== null) {
      return this.ls.key(index);
    }
    return null;
  }

  get length(): number {
    if (this.ls !== null) {
      return this.ls.length;
    }
    return 0;
  }
}

const localStorageService = new LocalStorageService();

export default localStorageService;
