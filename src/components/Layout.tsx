import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HamburgerMenu } from './HamburgerMenu';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

/**
 * App shell with header, main content area, and offline indicator.
 * Includes proper ARIA landmarks and focus management.
 */
export function Layout({ children, title = 'Inventori', showBack = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  // Focus management: scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-surface-secondary">
      {/* Skip to content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent-600 focus:text-white focus:rounded-lg"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-accent-500 text-white shadow-md sticky top-0 z-10" role="banner">
        <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
          {/* Left: Back button or spacer */}
          <div className="w-11 flex-shrink-0">
            {(showBack || !isHome) && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-accent-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Go back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5L8.25 12l7.5-7.5"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Center: Title */}
          <h1 className="text-lg font-semibold truncate flex-1 text-center px-2">{title}</h1>

          {/* Right: Search button and Menu */}
          <nav className="flex items-center gap-1 flex-shrink-0" aria-label="Main navigation">
            <button
              onClick={() => navigate('/search')}
              className="p-2 rounded-full hover:bg-accent-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
            <HamburgerMenu />
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main 
        id="main-content" 
        className="p-4 max-w-4xl mx-auto"
        role="main"
        tabIndex={-1}
      >
        {children}
      </main>
    </div>
  );
}
