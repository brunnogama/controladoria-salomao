import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, History, 
  Settings, LogOut, UserCircle, Trello 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customLogo, setCustomLogo] = useState(null);
  const [userName, setUserName] = useState('Visitante');

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo_path');
    if (savedLogo && savedLogo !== '/') setCustomLogo(savedLogo);

    const storedName = localStorage.getItem('user_name');
    if (storedName) setUserName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const isActive = (path) => {
    const base = "flex items-center gap-4 px-4 py-3.5 text-base rounded-xl transition-all ";
    const active = "bg-white/10 text-white font-bold border-l-4 border-yellow-400 shadow-lg";
    const inactive = "text-blue-100 hover:bg-white/5 hover:text-white";
    
    const current = location.pathname;
    const isMatched = (path === '/' && current === '/') || (path !== '/' && current.startsWith(path));
    
    return base + (isMatched ? active : inactive);
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={22} /> },
    { path: '/kanban', label: 'Kanban', icon: <Trello size={22} /> },
    { path: '/contratos', label: 'Contratos', icon: <FileText size={22} /> },
    { path: '/clientes', label: 'Clientes', icon: <Users size={22} /> },
    { path: '/historico', label: 'Histórico', icon: <History size={22} /> },
  ];

  return (
    <aside className="w-64 bg-[#0F2C4C] text-white h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      {/* AREA DO LOGO */}
      <div className="p-8 flex flex-col items-center border-b border-white/5 bg-black/5">
        {customLogo ? (
          <img src={customLogo} alt="Logo" className="h-12 w-auto object-contain" onError={() => setCustomLogo(null)} />
        ) : (
          <div className="text-center">
            <h1 className="text-xl font-bold tracking-tight">Salomão</h1>
            <p className="text-[10px] uppercase tracking-[0.25em] text-blue-300 font-black">Controladoria</p>
          </div>
        )}
      </div>

      {/* NAVEGAÇÃO */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {menuItems.map(item => (
          <Link key={item.path} to={item.path} className={isActive(item.path)}>
            {item.icon} <span className="tracking-wide">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* RODAPÉ */}
      <div className="p-4 border-t border-white/5 space-y-2 bg-black/5">
        <Link to="/configuracoes" className={isActive('/configuracoes')}>
          <Settings size={22} /> <span className="tracking-wide">Configurações</span>
        </Link>
        
        <div className="flex items-center justify-between p-3.5 bg-white/5 rounded-2xl border border-white/5 mt-2 overflow-hidden shadow-inner">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserCircle size={26} className="text-blue-400 shrink-0" />
            <span className="text-sm font-bold truncate max-w-[100px] text-blue-50">{userName}</span>
          </div>
          <button onClick={handleLogout} title="Sair" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition-all">
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
