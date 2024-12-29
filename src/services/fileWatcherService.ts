type FileChangeCallback = (path: string) => void;

class FileWatcherService {
  private watchers: Map<string, FileChangeCallback[]> = new Map();

  constructor() {
    // Setup file watching using browser APIs
    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('file-changes');
      channel.onmessage = (event) => {
        const { path } = event.data;
        this.notifyWatchers(path);
      };
    }
  }

  watch(path: string, callback: FileChangeCallback) {
    if (!this.watchers.has(path)) {
      this.watchers.set(path, []);
    }
    this.watchers.get(path)?.push(callback);
  }

  unwatch(path: string, callback: FileChangeCallback) {
    const callbacks = this.watchers.get(path);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
      if (callbacks.length === 0) {
        this.watchers.delete(path);
      }
    }
  }

  private notifyWatchers(path: string) {
    const callbacks = this.watchers.get(path);
    if (callbacks) {
      callbacks.forEach(callback => callback(path));
    }
  }
}

export const fileWatcherService = new FileWatcherService();
