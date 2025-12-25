import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FileText, Users, History, Settings, LogOut, UserCircle, Trello } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [customLogo, setCustomLogo] = useState(null);
  const [userName, setUserName] = useState('Visitante');

  useEffect(() => {
    const savedLogo = localStorage.getItem('app_logo_path');
    if (savedLogo && savedLogo !== '/') setCustomLogo(savedLogo);

    const storedName = localStorage.getItem('user_name');
    if (storedName) setUserName(storedName);
  }, []);

  const isActive = (path) => {
    const base = "flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all ";
    if (location.pathname === path || (path !== '/' && location.pathname.startsWith(path))) {
      return base + "bg-white/10 text-white font-bold border-l-4 border-yellow-400";
    }
    return base + "text-blue-100 hover:bg-white/10 hover:text-white";
  };

  return (
    <aside className="w-64 bg-[#0F2C4C] text-white h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl">
      <div className="p-6 flex flex-col items-center border-b border-white/10">
        {customLogo ? (
          <img src={customLogo} alt="Logo" className="h-12 object-contain" onError={() => setCustomLogo(null)} />
        ) : (
          <div className="text-center">
            <h1 className="text-lg font-bold">Salomão</h1>
            <p className="text-[8px] uppercase tracking-widest text-blue-300">Controladoria</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        <Link to="/" className={isActive('/')}><LayoutDashboard size={20} /> Dashboard</Link>
        <Link to="/kanban" className={isActive('/kanban')}><Trello size={20} /> Kanban</Link>
        <Link to="/contratos" className={isActive('/contratos')}><FileText size={20} /> Contratos</Link>
        <Link to="/clientes" className={isActive('/clientes')}><Users size={20} /> Clientes</Link>
        <Link to="/historico" className={isActive('/historico')}><History size={20} /> Histórico</Link>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link to="/configuracoes" className={isActive('/configuracoes')}><Settings size={20} /> Configurações</Link>
        <div className="flex items-center justify-between p-3 bg-black/10 rounded-lg">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserCircle size={24} className="text-blue-300 shrink-0" />
            <span className="text-xs font-bold truncate">{userName}</span>
          </div>
          <button onClick={() => {localStorage.clear(); window.location.href='/login'}} className="text-red-300 p-1.5"><LogOut size={18} /></button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
