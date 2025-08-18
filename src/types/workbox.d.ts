declare module 'workbox-window' {
  interface Workbox {
    addEventListener: (event: string, callback: (event: any) => void) => void;
    register: () => Promise<void>;
  }
}

declare global {
  interface Window {
    workbox: import('workbox-window').Workbox;
  }
} 