import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-blue-700' : 'text-gray-600 hover:text-gray-900'}`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-blue-700 text-lg">
              🏐 VBLeague
            </Link>
            <div className="hidden sm:flex items-center gap-6">
              <NavLink to="/leagues" className={linkClass}>Leagues</NavLink>
              <NavLink to="/invites" className={linkClass}>Invites</NavLink>
              <NavLink to="/equipment" className={linkClass}>Equipment</NavLink>
              {user && <NavLink to="/schedule" className={linkClass}>Schedule</NavLink>}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link to={`/profile/${user.id}`} className="text-sm font-medium text-gray-700 hover:text-gray-900">
                  {user.username}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
