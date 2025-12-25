import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, History, Settings, LogOut, UserCircle, Trello } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customLogo, setCustomLogo] = useState(null);
  const [userName, setUserName] = useState('Visitante');

  useEffect(() => {
    // Busca a logo interna salva
    const savedLogo = localStorage.getItem('app_logo_path');
    if (savedLogo && savedLogo !== '/') setCustomLogo(savedLogo);

    const storedName = localStorage.getItem('user_name');
    if (storedName) setUserName(storedName);
  }, []);

  const handleLogout = () => {
    // IMPORTANTE: Remove apenas o usuário, NÃO usa clear()
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const isActive = (path) => {
    const base = "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all ";
    const active = "bg-white/10 text-white font-bold border-l-4 border-yellow-400 shadow-md";
    const inactive = "text-blue-100 hover:bg-white/5 hover:text-white";
    
    const current = location.pathname;
    const isMatched = (path === '/' && current === '/') || (path !== '/' && current.startsWith(path));
    
    return base + (isMatched ? active : inactive);
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/kanban', label: 'Kanban', icon: <Trello size={18} /> },
    { path: '/contratos', label: 'Contratos', icon: <FileText size={18} /> },
    { path: '/clientes', label: 'Clientes', icon: <Users size={18} /> },
    { path: '/historico', label: 'Histórico', icon: <History size={18} /> },
  ];

  return (
    <aside className="w-64 bg-[#0F2C4C] text-white h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      <div className="p-8 flex flex-col items-center border-b border-white/5">
        {customLogo ? (
          <img src={customLogo} alt="Logo" className="h-10 w-auto object-contain" onError={() => setCustomLogo(null)} />
        ) : (
          <div className="text-center">
            <h1 className="text-lg font-bold tracking-tight">Salomão</h1>
            <p className="text-[8px] uppercase tracking-[0.2em] text-blue-300 font-black">Controladoria</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1">
        {menuItems.map(item => (
          <Link key={item.path} to={item.path} className={isActive(item.path)}>
            {item.icon} <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5 space-y-1">
        <Link to="/configuracoes" className={isActive('/configuracoes')}>
          <Settings size={18} /> <span>Configurações</span>
        </Link>
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 mt-2 overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserCircle size={22} className="text-blue-400 shrink-0" />
            <span className="text-xs font-bold truncate max-w-[100px]">{userName}</span>
          </div>
          <button onClick={handleLogout} title="Sair" className="text-red-400 hover:text-red-300 p-1.5 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
