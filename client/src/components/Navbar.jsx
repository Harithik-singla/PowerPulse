import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleColors = {
  citizen:  'bg-blue-500/10 text-blue-400 border-blue-500/20',
  operator: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  admin:    'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const dashPath = { citizen: '/dashboard', operator: '/operator', admin: '/admin' };

  return (
    <nav className="bg-[#0d1117] border-b border-gray-800/60 px-6 py-3 flex items-center justify-between">
      <Link
        to={dashPath[user?.role] || '/dashboard'}
        className="text-lg font-black text-white tracking-tight"
      >
        Power<span className="text-orange-500">Pulse</span>
      </Link>

      <div className="flex items-center gap-4">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-500">Live</span>
        </div>

        {/* Role badge */}
        {user && (
          <span className={`hidden sm:inline-flex text-xs font-medium px-2.5 py-1 rounded-full border capitalize ${roleColors[user.role]}`}>
            {user.role}
          </span>
        )}

        {/* User name */}
        {user && (
          <span className="text-sm text-gray-400 hidden sm:block">
            {user.name}
          </span>
        )}

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700/60 border border-gray-700/50 px-3 py-1.5 rounded-lg transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
          Logout
        </button>
      </div>
    </nav>
  );
}