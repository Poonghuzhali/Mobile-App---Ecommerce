import { useEffect } from 'react';
import { Platform } from 'react-native';

/** Web: hide scrollbar tracks; scroll still works via wheel / touch / drag. */
export function useWebScrollChrome() {
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const id = 'vexo-scroll-chrome';
    if (document.getElementById(id)) return;

    const style = document.createElement('style');
    style.id = id;
    style.textContent = `
      html, body {
        height: 100%;
        margin: 0;
        overflow: hidden;
      }
      #root {
        display: flex;
        flex: 1;
        height: 100%;
        min-height: 100%;
        overflow: hidden;
      }
      * {
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      *::-webkit-scrollbar {
        width: 0 !important;
        height: 0 !important;
        display: none !important;
        background: transparent;
      }
    `;
    document.head.appendChild(style);
  }, []);
}
