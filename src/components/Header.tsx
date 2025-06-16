import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Microscope, User, LogOut, Home, FileText, BarChart3, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function Header() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const authenticatedNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/analyze', label: 'Analyze Paper', icon: FileText },
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  ];

  const unauthenticatedNavItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/analyze', label: 'Analyze Paper', icon: FileText },
  ];

  const navItems = user ? authenticatedNavItems : unauthenticatedNavItems;

  const handleNavClick = (path: string, e: React.MouseEvent) => {
    // If user is not authenticated and trying to access analyze page, show auth
    if (!user && path === '/analyze') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('showAuth'));
      return;
    }
    
    // For authenticated users or home page, navigate normally
    navigate(path);
  };

  const handleAuthAction = () => {
    if (user) {
      signOut();
    } else {
      // This will be handled by the parent component to show auth form
      window.dispatchEvent(new CustomEvent('showAuth'));
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
            <div className="bg-amber-900 p-2.5 rounded-xl shadow-lg">
              <Microscope className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-amber-900">
                PaperLenz
              </h1>
              <p className="text-xs text-amber-700 font-medium">See Science Clearly</p>
            </div>
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={(e) => handleNavClick(path, e)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>

          {/* User Menu / Auth Button */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <div className="flex items-center space-x-3 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
                  <div className="bg-amber-100 p-1.5 rounded-lg">
                    <User className="h-4 w-4 text-amber-900" />
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{user.username}</div>
                  </div>
                </div>
                <button
                  onClick={signOut}
                  className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium hidden sm:block">Logout</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleAuthAction}
                className="flex items-center space-x-2 bg-amber-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-amber-800 transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 py-2">
          <nav className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={(e) => handleNavClick(path, e)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                  location.pathname === path
                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}