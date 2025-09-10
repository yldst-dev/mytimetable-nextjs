'use client';

import { useEffect } from 'react';

export default function DevRefreshHelper() {
  useEffect(() => {
    // 개발 환경에서만 실행
    if (process.env.NODE_ENV !== 'development') return;

    // CSS 파일들이 제대로 로드되지 않은 경우를 감지
    const checkAndRefreshCSS = () => {
      const links = document.querySelectorAll('link[rel="stylesheet"]');
      let allLoaded = true;

      links.forEach((link) => {
        const linkElement = link as HTMLLinkElement;
        
        // CSS 파일이 로드되지 않았을 경우
        if (!linkElement.sheet) {
          console.warn('[DevRefresh] CSS file not loaded:', linkElement.href);
          allLoaded = false;
          
          // CSS 파일 강제 새로고침
          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = linkElement.href + '?t=' + Date.now(); // 캐시 무효화
          newLink.onload = () => {
            console.log('[DevRefresh] CSS reloaded:', newLink.href);
            linkElement.remove();
          };
          newLink.onerror = () => {
            console.error('[DevRefresh] Failed to reload CSS:', newLink.href);
          };
          
          document.head.appendChild(newLink);
        }
      });

      return allLoaded;
    };

    // 키보드 단축키로 강제 새로고침 (Ctrl/Cmd + Shift + R)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.shiftKey && (event.ctrlKey || event.metaKey) && event.key === 'R') {
        event.preventDefault();
        console.log('[DevRefresh] Force refresh triggered');
        
        // 모든 CSS 링크 제거 후 재로드
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach((link) => {
          const linkElement = link as HTMLLinkElement;
          const newLink = document.createElement('link');
          newLink.rel = 'stylesheet';
          newLink.href = linkElement.href.split('?')[0] + '?t=' + Date.now();
          document.head.appendChild(newLink);
          linkElement.remove();
        });
        
        // 페이지 새로고침
        setTimeout(() => window.location.reload(), 100);
      }
    };

    // 페이지 로드 후 CSS 상태 확인
    const timer = setTimeout(() => {
      if (!checkAndRefreshCSS()) {
        console.warn('[DevRefresh] Some CSS files failed to load, consider refreshing');
      }
    }, 2000);

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, []);

  // 개발 환경에서만 표시되는 새로고침 버튼
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <button
      onClick={() => window.location.reload()}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#ef4444',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        fontSize: '18px',
        cursor: 'pointer',
        zIndex: 9999,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        display: 'none' // 기본적으로 숨김, CSS 문제가 있을 때만 표시
      }}
      title="CSS 로딩 문제 발생시 클릭 (Ctrl+Shift+R)"
    >
      🔄
    </button>
  );
}