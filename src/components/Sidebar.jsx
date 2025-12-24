import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  History, 
  BarChart2, 
  Settings, 
  LogOut,
  UserCircle
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [customLogo, setCustomLogo] = useState(null);
  const [userName, setUserName] = useState('Visitante');

  useEffect(() => {
    // 1. Carrega o Logo
    const savedLogo = localStorage.getItem('app_logo_path');
    if (savedLogo) setCustomLogo(savedLogo);

    // 2. Carrega o Nome do Usuário
    const storedName = localStorage.getItem('user_name');
    if (storedName) setUserName(storedName);
  }, []);

  const isActive = (path) => {
    if (path === '/' && location.pathname !== '/') return "text-blue-100 hover:bg-white/10 hover:text-white";
    if (path !== '/' && location.pathname.startsWith(path)) return "bg-white/10 text-white font-bold border-l-4 border-yellow-400";
    if (location.pathname === path) return "bg-white/10 text-white font-bold border-l-4 border-yellow-400";
    return "text-blue-100 hover:bg-white/10 hover:text-white transition-colors";
  };

  const menuItems = [
    { path: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/contratos', icon: <FileText size={20} />, label: 'Contratos' },
    { path: '/clientes', icon: <Users size={20} />, label: 'Clientes' },
    { path: '/historico', icon: <History size={20} />, label: 'Histórico' },
    { path: '/volumetria', icon: <BarChart2 size={20} />, label: 'Volumetria' },
  ];

  // Função de Logout (Limpa dados e redireciona)
  const handleLogout = () => {
    // Limpa dados de sessão se necessário ou redireciona
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen bg-[#0F2C4C] text-white flex flex-col fixed left-0 top-0 shadow-xl z-50">
      
      {/* ÁREA DO LOGO */}
      <div className="p-6 border-b border-white/10 flex flex-col justify-center min-h-[100px]">
        {customLogo ? (
          <div className="flex flex-col items-center text-center w-full">
            <img 
              src={customLogo} 
              alt="Logo Salomão Advogados" 
              className="max-h-16 w-auto object-contain mb-2"
              onError={(e) => {
                e.target.style.display = 'none'; 
                setCustomLogo(null);
              }} 
            />
            <p className="text-[10px] text-blue-200 font-medium tracking-wide uppercase">
              Controladoria Jurídica
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center w-full">
            <h1 className="text-xl font-bold tracking-tight leading-tight mb-1">
              Salomão Advogados
            </h1>
            <p className="text-[10px] text-blue-200 font-medium tracking-wide uppercase">
              Controladoria Jurídica
            </p>
          </div>
        )}
      </div>

      {/* MENU PRINCIPAL */}
      <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-6 py-3 text-sm ${isActive(item.path)}`}
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
          className={`flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors ${isActive('/configuracoes')}`}
        >
          <Settings size={20} />
          <span>Configurações</span>
        </Link>

        {/* BARRA DE PERFIL COM SAIR AO LADO */}
        <div className="flex items-center justify-between p-3 bg-[#0d2642] rounded-lg border border-white/5 mt-2">
          
          {/* Lado Esquerdo: Ícone + Nome */}
          <div className="flex items-center gap-3 overflow-hidden">
            <UserCircle size={24} className="text-blue-300 shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <p className="text-[10px] text-blue-400 uppercase font-bold leading-none mb-0.5">Usuário</p>
              <p className="text-sm font-bold text-white truncate max-w-[90px]" title={userName}>
                {userName}
              </p>
            </div>
          </div>

          {/* Lado Direito: Botão Sair */}
          <button 
            onClick={handleLogout}
            className="text-red-300 hover:text-red-400 hover:bg-red-500/20 p-2 rounded-md transition-colors"
            title="Sair do Sistema"
          >
            <LogOut size={18} />
          </button>

        </div>

      </div>

    </div>
  );
};

export default Sidebar;