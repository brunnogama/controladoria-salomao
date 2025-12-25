import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  History, 
  Settings, 
  UserCircle,
  LogOut,
  Trello // Ícone para o Kanban
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [customLogo, setCustomLogo] = useState(null);
  const [userName, setUserName] = useState('Visitante');

  useEffect(() => {
    // 1. Carrega o Logo personalizado
    const savedLogo = localStorage.getItem('app_logo_path');
    if (savedLogo) setCustomLogo(savedLogo);

    // 2. Carrega o Nome do Usuário
    const storedName = localStorage.getItem('user_name');
    if (storedName) setUserName(storedName);
  }, []);

  // Função para definir se o link está ativo (estilo visual)
  const isActive = (path) => {
    const activeStyle = "bg-white/10 text-white font-bold border-l-4 border-yellow-400";
    const inactiveStyle = "text-blue-100 hover:bg-white/10 hover:text-white transition-colors";
    
    if (path === '/' && location.pathname === '/') return activeStyle;
    if (path !== '/' && location.pathname.startsWith(path)) return activeStyle;
    
    return inactiveStyle;
  };

  const handleLogout = () => {
    // Lógica de logout (ex: limpar localStorage e redirecionar)
    localStorage.removeItem('user_name');
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/kanban', label: 'Kanban', icon: <Trello size={20} /> }, // Item Adicionado
    { path: '/contratos', label: 'Contratos', icon: <FileText size={20} /> },
    { path: '/clientes', label: 'Clientes', icon: <Users size={20} /> },
    { path: '/historico', label: 'Histórico', icon: <History size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#0F2C4C] text-white h-screen flex flex-col fixed left-0 top-0 z-50 shadow-xl">
      {/* LOGO AREA */}
      <div className="p-6 flex flex-col items-center border-b border-white/10">
        {customLogo ? (
          <img 
            src={customLogo} 
            alt="Logo" 
            className="h-16 w-auto object-contain mb-2"
          />
        ) : (
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-2 shadow-inner">
            <FileText size={28} className="text-white" />
          </div>
        )}
        <h1 className="text-sm font-bold tracking-widest text-blue-100 uppercase text-center">
          Controladoria
        </h1>
      </div>

      {/* NAVEGAÇÃO PRINCIPAL */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg ${isActive(item.path)}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* RODAPÉ DO MENU */}
      <div className="p-4 border-t border-white/10 flex flex-col gap-2">
        <Link 
          to="/configuracoes" 
          className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${isActive('/configuracoes')}`}
        >
          <Settings size={20} />
          <span>Configurações</span>
        </Link>

        {/* BARRA DE PERFIL */}
        <div className="flex items-center justify-between p-3 bg-[#0d2642] rounded-lg border border-white/5 mt-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <UserCircle size={24} className="text-blue-300 shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <p className="text-[10px] text-blue-400 uppercase font-bold leading-none mb-0.5">Usuário</p>
              <p className="text-sm font-bold text-white truncate max-w-[80px]" title={userName}>
                {userName}
              </p>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="text-red-300 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-md transition-all"
            title="Sair"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
