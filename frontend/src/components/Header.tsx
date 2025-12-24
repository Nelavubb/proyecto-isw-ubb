import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
  variant?: 'default' | 'dashboard';
  showLogout?: boolean;
}

const Header = ({ title = 'Facultad de Derecho', variant = 'default', showLogout = true }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#003366] text-white py-4 px-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo y Título */}
          <div className="flex items-center gap-4">
            <a
              href="https://intranet.ubiobio.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <img
                src="/imgs/ubb_logo_extendido.png"
                alt="Logo UBB"
                className="h-12 w-auto object-contain bg-white/95 rounded-md px-3 py-1.5 border border-white/20 shadow-sm hover:bg-white transition-colors cursor-pointer"
              />
            </a>
            <div className="h-10 w-px bg-white/30"></div>
            <a href="/Dashboard" className="text-xl font-semibold hover:text-gray-200 transition-colors">{title}</a>
          </div>

          {/* Botón de Cerrar Sesión */}
          {showLogout && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="flex items-center gap-2 px-4 py-2 hover:bg-[#004488] hover:text-red-500 rounded-lg transition-colors font-medium"
                title="Cerrar Sesión"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Variant: 'default' - Fixed Curve for standard pages */}
      {/* Adjusted top-72px to top-[80px] to account for the py-4 + h-12 header (approx 80px) */}
      {variant === 'default' && (
        <div className="fixed top-[80px] left-0 right-0 z-0 pointer-events-none">
          <div className="bg-[#003366]">
            <div className="h-3 bg-gray-100 rounded-t-3xl mx-auto -mb-1"></div>
          </div>
        </div>
      )}

      {/* Variant: 'dashboard' - Encapsulated Dashboard Background & Sticky Curve */}
      {variant === 'dashboard' && (
        <>
          {/* Static Background Layer (Flow) */}
          <div className="bg-[#003366] h-60"></div>

          {/* Sticky Curve Layer (Sticky Flow) */}
          {/* Adjusted top-72px to top-[80px] */}
          <div className="sticky top-[80px] z-0 pointer-events-none">
            <div className="bg-[#003366]">
              <div className="h-3 bg-gray-100 rounded-t-3xl mx-auto -mb-1"></div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
