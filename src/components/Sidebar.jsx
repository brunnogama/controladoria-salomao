import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, History, 
  Settings, UserCircle, LogOut, Trello 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [customLogo, setCustomLogo] = useState(null);
  const [userName, setUserName] = useState('Visitante');

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo_path');
    if (savedLogo) setCustomLogo(savedLogo);

    const storedName = localStorage.getItem('user_name');
    if (storedName) setUserName(storedName);
  }, []);

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return "text-blue-100 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3 px-4 py-3 text-sm rounded-lg";
    if (path !== '/' && location.pathname.startsWith(path)) return "bg-white/10 text-white font-bold border-l-4 border-yellow-400 flex items-center gap-3 px-4 py-3 text-sm rounded-lg";
    if (location.pathname === path) return "bg-white/10 text-white font-bold border-l-4 border-yellow-400 flex items-center gap-3 px-4 py-3 text-sm rounded-lg";
    return "text-blue-100 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-3 px-4 py-3 text-sm rounded-lg";
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/kanban', label: 'Kanban', icon: <Trello size={20} /> },
    { path: '/contratos', label: 'Contratos', icon: <FileText size={20} /> },
    { path: '/clientes', label: 'Clientes', icon: <Users size={20} /> },
    { path: '/historico', label: 'Histórico', icon: <History size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#0F2C4C] text-white h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl">
      <div className="p-6 flex flex-col items-center border-b border-white/10">
        {customLogo ? (
          <img src={customLogo} alt="Logo" className="h-14 object-contain" />
        ) : (
          <div className="text-center">
            <h1 className="text-lg font-bold">Salomão</h1>
            <p className="text-[8px] uppercase tracking-widest text-blue-300">Controladoria</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className={isActive(item.path)}>
            {item.icon} <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link to="/configuracoes" className={isActive('/configuracoes')}>
          <Settings size={20} /> <span>Configurações</span>
        </Link>
        <div className="flex items-center justify-between p-3 bg-black/10 rounded-lg border border-white/5 mt-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserCircle size={24} className="text-blue-300 shrink-0" />
            <span className="text-xs font-bold truncate">{userName}</span>
          </div>
          <button onClick={handleLogout} className="text-red-300 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-md">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
