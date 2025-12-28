import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, History, 
  Settings, LogOut, UserCircle, FolderOpen, Kanban, Shield, FileCheck, BarChart3
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userName, setUserName] = useState('Visitante');

  useEffect(() => {
    const storedName = localStorage.getItem('user_name');
    if (storedName) setUserName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const isActive = (path) => {
    const isMatched = (path === '/' && location.pathname === '/') || (path !== '/' && location.pathname.startsWith(path));
    return `flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ${
      isMatched ? "bg-white/10 text-white font-bold border-l-4 border-yellow-400 shadow-md" : "text-blue-100 hover:bg-white/10 hover:text-white"
    }`;
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-[#0F2C4C] text-white z-50 shadow-xl flex flex-col">
      <div className="p-6 flex flex-col items-center border-b border-white/10">
        <img 
          src="/logo-branca.png" 
          alt="Logo Salomão Advogados" 
          className="h-10 w-auto object-contain" 
        />
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <Link to="/" className={isActive('/')}><LayoutDashboard size={20} /> Dashboard</Link>
        <Link to="/contratos" className={isActive('/contratos')}><FileText size={20} /> Contratos</Link>
        <Link to="/propostas" className={isActive('/propostas')}><FileCheck size={20} /> Propostas</Link>
        <Link to="/volumetria" className={isActive('/volumetria')}><BarChart3 size={20} /> Volumetria</Link>
        <Link to="/compliance" className={isActive('/compliance')}><Shield size={20} /> Compliance</Link>
        <Link to="/clientes" className={isActive('/clientes')}><Users size={20} /> Clientes</Link>
        <Link to="/kanban" className={isActive('/kanban')}><Kanban size={20} /> Kanban</Link>
        <Link to="/ged" className={isActive('/ged')}><FolderOpen size={20} /> GED</Link>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-2">
        <Link to="/historico" className={isActive('/historico')}><History size={20} /> Histórico</Link>
        <Link to="/configuracoes" className={isActive('/configuracoes')}><Settings size={20} /> Configurações</Link>
        <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 mt-2 overflow-hidden">
          <div className="flex items-center gap-2 overflow-hidden">
            <UserCircle size={24} className="text-blue-300 shrink-0" />
            <span className="text-xs font-bold truncate text-blue-50">{userName}</span>
          </div>
          <button onClick={handleLogout} className="text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg transition-colors"><LogOut size={18} /></button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
