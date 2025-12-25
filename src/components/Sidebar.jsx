import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, FileText, Users, History, 
  Settings, LogOut, UserCircle, Menu, X 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customLogo, setCustomLogo] = useState(null);
  const [userName, setUserName] = useState('Visitante');
  const [isOpen, setIsOpen] = useState(false);

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
    const base = "flex items-center gap-3 px-4 py-3 text-sm rounded-xl transition-all ";
    const active = "bg-white/10 text-white font-bold border-l-4 border-yellow-400 shadow-md";
    const inactive = "text-blue-100 hover:bg-white/10 hover:text-white";
    const isMatched = (path === '/' && location.pathname === '/') || (path !== '/' && location.pathname.startsWith(path));
    return base + (isMatched ? active : inactive);
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#0F2C4C] text-white rounded-lg shadow-lg">
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && <div className="fixed inset-0 bg-black/50 z-[50] lg:hidden" onClick={() => setIsOpen(false)} />}

      <aside className={`fixed left-0 top-0 h-screen bg-[#0F2C4C] text-white z-[55] shadow-xl transition-transform duration-300 w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-6 flex flex-col items-center border-b border-white/10">
          {customLogo ? (
            <img src={customLogo} alt="Logo" className="h-10 w-auto object-contain" onError={() => setCustomLogo(null)} />
          ) : (
            <div className="text-center">
              <h1 className="text-lg font-bold tracking-tight">Salomão</h1>
              <p className="text-[8px] uppercase tracking-widest text-blue-300 font-black">Controladoria</p>
            </div>
          )}
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link to="/" className={isActive('/')} onClick={() => setIsOpen(false)}><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/contratos" className={isActive('/contratos')} onClick={() => setIsOpen(false)}><FileText size={20} /> Contratos</Link>
          <Link to="/clientes" className={isActive('/clientes')} onClick={() => setIsOpen(false)}><Users size={20} /> Clientes</Link>
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link to="/historico" className={isActive('/historico')} onClick={() => setIsOpen(false)}><History size={20} /> Histórico</Link>
          <Link to="/configuracoes" className={isActive('/configuracoes')} onClick={() => setIsOpen(false)}><Settings size={20} /> Configurações</Link>
          <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 mt-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <UserCircle size={24} className="text-blue-300 shrink-0" />
              <span className="text-xs font-bold truncate text-blue-50">{userName}</span>
            </div>
            <button onClick={handleLogout} className="text-red-400 p-1.5"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
