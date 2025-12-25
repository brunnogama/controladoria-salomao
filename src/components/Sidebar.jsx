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
  const [isOpen, setIsOpen] = useState(false); // Controle do menu mobile

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
    const inactive = "text-blue-100 hover:bg-white/10 hover:text-white transition-colors";
    
    const current = location.pathname;
    const isMatched = (path === '/' && current === '/') || (path !== '/' && current.startsWith(path));
    
    return base + (isMatched ? active : inactive);
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/contratos', label: 'Contratos', icon: <FileText size={20} /> },
    { path: '/clientes', label: 'Clientes', icon: <Users size={20} /> },
  ];

  return (
    <>
      {/* BOTÃO HAMBÚRGUER (APENAS MOBILE) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-[#0F2C4C] text-white rounded-lg shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* OVERLAY PARA FECHAR MENU AO CLICAR FORA (MOBILE) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[50] lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed left-0 top-0 h-screen bg-[#0F2C4C] text-white z-[55] shadow-xl transition-transform duration-300 w-64
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* HEADER / LOGO */}
        <div className="p-6 flex flex-col items-center border-b border-white/10">
          {customLogo ? (
            <img src={customLogo} alt="Logo" className="h-10 w-auto object-contain" />
          ) : (
            <div className="text-center">
              <h1 className="text-lg font-bold tracking-tight">Salomão</h1>
              <p className="text-[8px] uppercase tracking-widest text-blue-300 font-black">Controladoria</p>
            </div>
          )}
        </div>

        {/* MENU PRINCIPAL */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={isActive(item.path)}
              onClick={() => setIsOpen(false)} // Fecha ao clicar no mobile
            >
              {item.icon} <span className="tracking-normal">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* MENU INFERIOR */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link to="/historico" className={isActive('/historico')} onClick={() => setIsOpen(false)}>
            <History size={20} /> <span className="tracking-normal">Histórico</span>
          </Link>
          
          <Link to="/configuracoes" className={isActive('/configuracoes')} onClick={() => setIsOpen(false)}>
            <Settings size={20} /> <span className="tracking-normal">Configurações</span>
          </Link>

          <div className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5 mt-2">
            <div className="flex items-center gap-2 overflow-hidden">
              <UserCircle size={24} className="text-blue-300 shrink-0" />
              <span className="text-xs font-bold truncate text-blue-50">{userName}</span>
            </div>
            <button onClick={handleLogout} className="text-red-300 p-1.5"><LogOut size={18} /></button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
