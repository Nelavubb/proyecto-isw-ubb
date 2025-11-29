import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title?: string;
}

const Header = ({ title = 'Facultad de Derecho' }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
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

        {/* Botón de Configuración */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/configuracion')}
            className="p-2 hover:bg-[#004488] rounded-lg transition-colors"
            title="Configuración"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
