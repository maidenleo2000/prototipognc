import React, { useState, useEffect } from 'react';
import { Fuel, Gift, Calendar, Zap, CarFront, CheckCircle2, Ticket, LogOut, Lock, User } from 'lucide-react';
import './index.css';

const weekDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const promosData = [
  { day: 0, text: 'Domingo Familiar: 10% descuento', discount: 10, isActive: false },
  { day: 1, text: 'GNC de Lunes: Doble Puntaje', discount: 0, isActive: false },
  { day: 2, text: 'Martes 15% Off en Carga Completa', discount: 15, isActive: false },
  { day: 3, text: 'Miércoles Renovable: 5% Off', discount: 5, isActive: false },
  { day: 4, text: 'Jueves GNC + Lavado al 20%', discount: 20, isActive: false },
  { day: 5, text: 'Viernes Pre-finde: 10% Off', discount: 10, isActive: false },
  { day: 6, text: 'Sábado Viajero: 15% Off', discount: 15, isActive: false },
];

const rewardsCatalogue = [
  { id: 1, title: 'Lavado Completo', points: 300, icon: <CarFront size={24} /> },
  { id: 2, title: '50% Off en Carga', points: 500, icon: <Fuel size={24} /> },
  { id: 3, title: 'Carga Gratis', points: 1000, icon: <Zap size={24} /> },
  { id: 4, title: 'Café en Tienda', points: 150, icon: <Ticket size={24} /> },
];

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [points, setPoints] = useState(120);
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [modalData, setModalData] = useState({ show: false, title: '', message: '' });

  const activePromo = promosData.find((p) => p.day === currentDay);

  const handleSimulateCharge = () => {
    const basePoints = 50;
    // Lunes doble puntaje
    const pointsToAdd = currentDay === 1 ? basePoints * 2 : basePoints;
    setPoints(points + pointsToAdd);
    
    setModalData({
      show: true,
      title: '¡Carga Exitosa!',
      message: `Has sumado ${pointsToAdd} puntosGNC a tu cuenta.`
    });
  };

  const handleRedeem = (reward) => {
    if (points >= reward.points) {
      setPoints(points - reward.points);
      setModalData({
        show: true,
        title: '¡Recompensa Canjeada!',
        message: `Has canjeado exitosamente: ${reward.title}.`
      });
    }
  };

  const closeModal = () => setModalData({ show: false, title: '', message: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (loginForm.username === 'test' && loginForm.password === 'test') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Usuario o clave incorrectos. Intenta con "test"');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ username: '', password: '' });
  };

  if (!isAuthenticated) {
    return (
      <div className="app-container login-wrapper">
        <div className="login-card card-glass">
          <div className="login-header">
            <Fuel className="logo-icon" size={48} />
            <h2>Bienvenido a <span className="highlight">EkoGNC</span></h2>
            <p>Ingresa tus datos para continuar</p>
          </div>
          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input 
                type="text" 
                placeholder="Usuario" 
                className="input-field"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              />
            </div>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input 
                type="password" 
                placeholder="Contraseña" 
                className="input-field"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              />
            </div>
            {loginError && <div className="error-message">{loginError}</div>}
            <button type="submit" className="btn-primary login-btn">
              Iniciar Sesión
            </button>
          </form>
          <div className="mock-credentials">
            Credenciales de prueba: <strong>test</strong> / <strong>test</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo-container">
          <Fuel className="logo-icon" size={32} />
          EkoGNC
        </div>
        
        <div className="user-module">
          <div className="points-badge">
            <Zap className="points-icon" size={20} />
            <span>{points} Pts</span>
          </div>
          <div className="user-avatar" title="Cerrar sesión" onClick={handleLogout} style={{cursor: 'pointer'}}>
            <LogOut size={20} color="#ff5252" />
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>Energía que <span className="highlight">Te Premia</span></h1>
        <p>Ahorrá y acumulá puntos en cada carga de GNC. Canjeá tus puntos por descuentos exclusivos y beneficios en nuestra red de estaciones.</p>
      </section>

      <div className="dashboard-grid">
        {/* Promos Column */}
        <div className="card-glass">
          <div className="section-header">
            <Calendar className="section-icon" size={28} />
            <h3>Promociones por Día</h3>
          </div>
          
          <div className="promo-list">
            {promosData.map((promo) => {
              const isActive = promo.day === currentDay;
              return (
                <div key={promo.day} className={`promo-item ${isActive ? 'active' : ''}`}>
                  <div>
                    <div className="promo-day">
                      {weekDays[promo.day]}
                      {isActive && <span className="active-badge">Hoy</span>}
                    </div>
                    <div className="promo-desc">{promo.text}</div>
                  </div>
                  <div className="promo-value">
                    {promo.discount > 0 ? `${promo.discount}%` : 'x2'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rewards Column */}
        <div className="card-glass">
          <div className="section-header">
            <Gift className="section-icon" size={28} />
            <h3>Catálogo de Premios</h3>
          </div>

          <div className="rewards-balance">
            <div className="balance-amount">
              {points} <Zap size={40} color="#00e676" />
            </div>
            <p style={{ color: 'var(--text-muted)' }}>Puntos Disponibles</p>
          </div>

          <div className="rewards-grid">
            {rewardsCatalogue.map((reward) => {
              const canAfford = points >= reward.points;
              return (
                <div 
                  key={reward.id} 
                  className={`reward-card ${!canAfford ? 'disabled' : ''}`}
                  onClick={() => canAfford && handleRedeem(reward)}
                >
                  <div className="reward-icon">
                    {reward.icon}
                  </div>
                  <div className="reward-title">{reward.title}</div>
                  <div className="reward-cost">{reward.points} pts</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button className="simulate-charge" onClick={handleSimulateCharge} title="Simular Carga de GNC">
        <Fuel size={28} />
      </button>

      {/* Success Modal */}
      <div className={`modal-overlay ${modalData.show ? 'active' : ''}`}>
        <div className="modal-content">
          <CheckCircle2 className="modal-icon" size={48} />
          <h2 className="modal-title">{modalData.title}</h2>
          <p className="modal-text">{modalData.message}</p>
          <button className="btn-close" onClick={closeModal}>Cerrar</button>
        </div>
      </div>
    </div>
  );
}

export default App;
