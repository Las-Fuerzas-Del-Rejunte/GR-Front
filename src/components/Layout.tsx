import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Kanban, FileText, Settings, LogOut, ChevronDown, Menu, X, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileUserMenu, setShowMobileUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showUserMenu) return;
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showUserMenu]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white/80 backdrop-blur border-b border-neutral-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Izquierda: Logo */}
            <div className="flex items-center space-x-3">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-md">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-neutral-900 tracking-tight">Sistema de Reclamos</h1>
                  <p className="text-xs text-neutral-500">Gestión Interna</p>
                </div>
              </div>

            {/* Centro: Enlaces */}
            <div className="hidden md:flex flex-1 justify-center space-x-2">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `relative flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'text-neutral-900 bg-neutral-100 border border-neutral-200 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </NavLink>
                <NavLink
                  to="/kanban"
                  className={({ isActive }) =>
                    `relative flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                      isActive
                        ? 'text-neutral-900 bg-neutral-100 border border-neutral-200 shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`
                  }
                >
                  <Kanban className="w-4 h-4" />
                  <span>Reclamos</span>
                </NavLink>
              </div>

            {/* Derecha: Usuario */}
            <div className="flex items-center gap-2 relative">
              <button
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-neutral-100"
                aria-label="Abrir menú"
                onClick={() => setShowMobileMenu(!showMobileMenu)}
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
              <div className="hidden md:block" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-3 hover:bg-neutral-50 px-3 py-2 rounded-lg transition-colors"
                >
                  <div className="text-right hidden md:block">
                    <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                    <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                    <span className="text-sm font-semibold text-white">{user && getInitials(user.name)}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 py-1.5 overflow-hidden z-50">
                    <NavLink
                      to="/perfil"
                      onClick={() => setShowUserMenu(false)}
                      className={({ isActive }) =>
                        `w-full flex items-center space-x-2 px-4 py-2.5 text-sm ${
                          isActive ? 'text-neutral-900 bg-neutral-100' : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                        } transition-colors`
                      }
                    >
                      <User className="w-4 h-4" />
                      <span>Mi Perfil</span>
                    </NavLink>
                    {user?.role !== 'viewer' && (
                      <NavLink
                        to="/configuracion"
                        onClick={() => setShowUserMenu(false)}
                        className={({ isActive }) =>
                          `w-full flex items-center space-x-2 px-4 py-2.5 text-sm ${
                            isActive ? 'text-neutral-900 bg-neutral-100' : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                          } transition-colors`
                        }
                      >
                        <Settings className="w-4 h-4" />
                        <span>Configuración</span>
                      </NavLink>
                    )}
                    <div className="border-t border-neutral-200 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden border-t border-neutral-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-3 space-y-1">
              <NavLink
                to="/"
                onClick={() => setShowMobileMenu(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/kanban"
                onClick={() => setShowMobileMenu(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium ${
                    isActive
                      ? 'bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-sm'
                      : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                  }`
                }
              >
                Reclamos
              </NavLink>
              <div className="my-2 border-t border-neutral-200" />
              <button
                className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium hover:bg-neutral-50"
                onClick={() => setShowMobileUserMenu(!showMobileUserMenu)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">{user && getInitials(user.name)}</span>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-neutral-900">{user?.name}</p>
                    <p className="text-xs text-neutral-500 capitalize">{user?.role}</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-neutral-500 transition-transform ${showMobileUserMenu ? 'rotate-180' : ''}`} />
              </button>
              {showMobileUserMenu && (
                <div className="pl-12 pr-3 space-y-1">
                  <NavLink
                    to="/perfil"
                    onClick={() => { setShowMobileUserMenu(false); setShowMobileMenu(false); }}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                          ? 'bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-sm'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                      }`
                    }
                  >
                    <User className="w-4 h-4" />
                    <span>Mi Perfil</span>
                  </NavLink>
                  <NavLink
                    to="/configuracion"
                    onClick={() => { setShowMobileUserMenu(false); setShowMobileMenu(false); }}
                    className={({ isActive }) =>
                      `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                        isActive
                          ? 'bg-neutral-100 text-neutral-900 border border-neutral-200 shadow-sm'
                          : 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
                      }`
                    }
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configuración</span>
                  </NavLink>
                  <div className="border-t border-neutral-200 my-1" />
                  <button
                    onClick={() => { setShowMobileUserMenu(false); setShowMobileMenu(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="w-full max-w-none px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
