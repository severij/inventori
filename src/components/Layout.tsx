import { useNavigate, useLocation } from 'react-router-dom';
import { HamburgerMenu } from './HamburgerMenu';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

/**
 * App shell with header, main content area, and offline indicator.
 */
export function Layout({ children, title = 'Inventori', showBack = false }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-500 text-white shadow-md sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Left: Back button or spacer */}
          <div className="w-10">
            {(showBack || !isHome) && (
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full hover:bg-blue-600 transition-colors"
                aria-label="Go back"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
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
          <h1 className="text-lg font-semibold truncate">{title}</h1>

          {/* Right: Search button and Menu */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/search')}
              className="p-2 rounded-full hover:bg-blue-600 transition-colors"
              aria-label="Search"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
            </button>
            <HamburgerMenu />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="p-4">{children}</main>
    </div>
  );
}
