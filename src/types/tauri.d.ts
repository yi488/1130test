// Declare the Tauri API on the window object
declare global {
  interface Window {
    __TAURI__: {
      invoke: (command: string) => Promise<void>;
      tauri: {
        invoke: (command: string) => Promise<void>;
      };
    };
  }
}

export {}; // This file needs to be a module
