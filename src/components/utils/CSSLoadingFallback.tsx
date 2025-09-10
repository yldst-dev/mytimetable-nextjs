'use client';

import { useEffect, useState } from 'react';

export default function CSSLoadingFallback({ children }: { children: React.ReactNode }) {
  const [cssLoaded, setCssLoaded] = useState(false);

  useEffect(() => {
    // CSS 로딩 상태 확인
    const checkCSSLoaded = () => {
      // CSS가 로드되었는지 확인하는 방법: 특정 클래스의 스타일이 적용되었는지 확인
      const testElement = document.createElement('div');
      testElement.className = 'bg-blue-500'; // Tailwind CSS 클래스
      testElement.style.visibility = 'hidden';
      testElement.style.position = 'absolute';
      document.body.appendChild(testElement);
      
      const computedStyle = window.getComputedStyle(testElement);
      const backgroundColor = computedStyle.backgroundColor;
      
      document.body.removeChild(testElement);
      
      // Tailwind의 bg-blue-500가 적용되었는지 확인
      if (backgroundColor && backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent') {
        setCssLoaded(true);
        return true;
      }
      return false;
    };

    // 즉시 확인
    if (checkCSSLoaded()) {
      return;
    }

    // CSS 로딩 대기
    let attempts = 0;
    const maxAttempts = 50; // 5초 대기 (100ms * 50)
    
    const checkInterval = setInterval(() => {
      attempts++;
      
      if (checkCSSLoaded() || attempts >= maxAttempts) {
        setCssLoaded(true);
        clearInterval(checkInterval);
      }
    }, 100);

    // 또는 document가 완전히 로드될 때까지 대기
    const onLoad = () => {
      setCssLoaded(true);
      clearInterval(checkInterval);
    };

    if (document.readyState === 'complete') {
      onLoad();
    } else {
      window.addEventListener('load', onLoad);
      return () => {
        window.removeEventListener('load', onLoad);
        clearInterval(checkInterval);
      };
    }

    return () => {
      clearInterval(checkInterval);
    };
  }, []);

  // CSS가 로드되지 않았을 때 인라인 스타일로 기본 레이아웃 제공
  if (!cssLoaded) {
    return (
      <div style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f8fafc',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px',
        color: '#1e293b'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e2e8f0',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{
          fontSize: '16px',
          color: '#64748b',
          textAlign: 'center'
        }}>
          스타일을 로딩중입니다...
        </p>
        
        <style dangerouslySetInnerHTML={{
          __html: `
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
        
        {/* 일정 시간 후에도 로딩되지 않으면 컨텐츠 표시 */}
        <div style={{ display: 'none' }}>
          {children}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}