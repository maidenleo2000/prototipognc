import { Fuel, Store, ShoppingBag, Settings, Zap, LogOut } from "lucide-react";

/**
 * Componente de Navegación superior con tabs para clientes y administrador.
 */
const Header = ({ 
  currentView, 
  setCurrentView, 
  isAdmin,
  points, 
  userProfile,
  handleLogout,
  appSettings,
  getIcon
}) => {
  const displayName = userProfile?.name || userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Usuario';
  return (
    <header className="header">
      <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
        <div style={{ color: 'var(--primary)' }}>
          {getIcon(appSettings?.siteIcon || 'fuel', 28)}
        </div>
        {appSettings?.siteName || 'EkoGNC'}
      </div>

      <nav className="main-nav">
        {/* Botón Principal - Vista de Dashboard */}
        <button 
          className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
          onClick={() => setCurrentView('home')}
        >
          <Store size={18} />
          Principal
        </button>
        {/* Botón Catalogo - Vista de Ventas */}
        <button 
          className={`nav-btn ${currentView === 'catalog' ? 'active' : ''}`}
          onClick={() => setCurrentView('catalog')}
        >
          <ShoppingBag size={18} />
          Catalogo
        </button>
        {/* Acceso al Panel - Visible para todos, pero con contenido condicional según el rol */}
        <button 
          className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
          onClick={() => setCurrentView('admin')}
        >
          <Settings size={18} />
          Panel
        </button>
      </nav>

      <div className="user-module">
        {/* Badge de puntos visibles en tiempo real (Oculto para admin) */}
        {!isAdmin && (
          <div className="points-badge">
            <Zap className="points-icon" size={20} />
            <span>{points} Pts</span>
          </div>
        )}
        
        {/* Información del usuario logueado */}
        <div className="logged-user-info">
          <span className="user-name-header">{displayName}</span>
          <div
            className="user-avatar"
            title="Cerrar sesión"
            onClick={handleLogout}
            style={{ cursor: "pointer" }}
          >
            <LogOut size={20} color="#ff5252" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
