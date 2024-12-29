import { useEffect } from 'react';
import { fileWatcherService } from '../services/fileWatcherService';

export function useFileWatcher(path: string, callback: (path: string) => void) {
  useEffect(() => {
    fileWatcherService.watch(path, callback);
    return () => {
      fileWatcherService.unwatch(path, callback);
    };
  }, [path, callback]);
}
