import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, History, 
  Settings, UserCircle, LogOut, Trello 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customLogo, setCustomLogo] = useState(null);
  const [userName, setUserName] = useState('Visitante');

  useEffect(() => {
    // Busca a logo configurada especificamente para o INTERIOR do app
    const savedLogo = localStorage.getItem('app_logo_path');
    if (savedLogo) setCustomLogo(savedLogo);

    const storedName = localStorage.getItem('user_name');
    if (storedName) setUserName(storedName);
  }, []);

  const isActive = (path) => {
    const base = "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all ";
    if (location.pathname === path || (path !== '/' && location.pathname.startsWith(path))) {
      return base + "bg-white/10 text-white font-bold border-l-4 border-yellow-400 shadow-lg";
    }
    return base + "text-blue-100 hover:bg-white/5 hover:text-white";
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <aside className="w-64 bg-[#0F2C4C] text-white h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl">
      <div className="p-8 flex flex-col items-center border-b border-white/5">
        {customLogo ? (
          <img src={customLogo} alt="Logo Sidebar" className="h-10 w-auto object-contain" />
        ) : (
          <FileText size={32} className="text-blue-400" />
        )}
        <span className="mt-3 text-[10px] font-black tracking-[0.2em] text-blue-300 uppercase">Controladoria</span>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        <Link to="/" className={isActive('/')}><LayoutDashboard size={18} /> Dashboard</Link>
        <Link to="/kanban" className={isActive('/kanban')}><Trello size={18} /> Kanban</Link>
        <Link to="/contratos" className={isActive('/contratos')}><FileText size={18} /> Contratos</Link>
        <Link to="/clientes" className={isActive('/clientes')}><Users size={18} /> Clientes</Link>
        <Link to="/historico" className={isActive('/historico')}><History size={18} /> Histórico</Link>
      </nav>

      <div className="p-4 bg-black/10 space-y-2">
        <Link to="/configuracoes" className={isActive('/configuracoes')}><Settings size={18} /> Configurações</Link>
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserCircle size={20} className="text-blue-300" />
            <span className="text-xs font-bold truncate">{userName}</span>
          </div>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-300"><LogOut size={18} /></button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
