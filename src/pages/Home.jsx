import React from "react";
import { Calendar, Gift, Zap, Fuel } from "lucide-react";

/**
 * Página principal (Dashboard) para clientes.
 * Muestra el balance de puntos, premios disponibles y promociones diarias.
 */
const Home = ({ 
  points, 
  isAdmin,
  currentDay, 
  promosData, 
  weekDays, 
  rewardsCatalogue, 
  handleRedeem,
  redemptionsState,
  userProfile,
  appSettings
}) => {
  const pendingRedemption = redemptionsState?.find(r => r.userId === userProfile?.uid && r.status === 'pending');

  return (
    <>
      <section className="hero">
        <h1>
          {appSettings?.heroTitleNormal || 'Energía que '}
          <span className="highlight">{appSettings?.heroTitleHighlight || 'Te Premia'}</span>
        </h1>
        <p>
          {appSettings?.heroSubtitle || 'Ahorrá y acumulá puntos en cada carga de GNC. Canjeá tus puntos por descuentos exclusivos y beneficios en nuestra red de estaciones.'}
        </p>
      </section>

      <div className="dashboard-grid">
        <div className="card-glass">
          <div className="section-header">
            <Calendar className="section-icon" size={28} />
            <h3>Promociones por Día</h3>
          </div>
          <div className="promo-list">
            {promosData.length > 0 ? (
              promosData.map((promo) => {
                const isActive = promo.day === currentDay;
                return (
                  <div key={promo.day} className={`promo-item ${isActive ? "active" : ""}`}>
                    <div>
                      <div className="promo-day">
                        {weekDays[promo.day]}
                        {isActive && <span className="active-badge">Hoy</span>}
                      </div>
                      <div className="promo-desc">{promo.text}</div>
                    </div>
                    <div className="promo-value">
                      {promo.discount > 0 
                        ? `${promo.discount}${(!promo.unit || promo.unit === '% Off' || promo.unit === '% OFF') ? '%' : ' ' + promo.unit}` 
                        : (promo.unit || '')}
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="empty-msg">No hay promociones cargadas por el admin.</p>
            )}
          </div>
        </div>

        <div className="card-glass">
          <div className="section-header">
            <Gift className="section-icon" size={28} />
            <h3>Catálogo de Premios</h3>
          </div>
          
          {/* Mostrar balance solo si no es admin */}
          {!isAdmin && (
            <div className="rewards-balance">
              {pendingRedemption && (
                <div className="status-alert gestionando">
                  <Zap size={16} className="spinning" /> Gestión de puntos en proceso...
                </div>
              )}
              <div className="balance-amount">
                {points} <Zap size={40} color="#00e676" />
              </div>
              <p style={{ color: "var(--text-muted)" }}>Puntos Disponibles</p>
            </div>
          )}

          <div className="rewards-grid">
            {rewardsCatalogue.length > 0 ? (
              rewardsCatalogue.map((reward) => {
                const canAfford = points >= reward.points;
                return (
                  <div
                    key={reward.id}
                    className={`reward-card ${(!canAfford && !isAdmin) ? "disabled" : ""}`}
                    onClick={() => canAfford && !isAdmin && handleRedeem(reward)}
                  >
                    <div className="reward-icon"><Fuel size={24} /></div>
                    <div className="reward-title">{reward.title}</div>
                    <div className="reward-cost">{reward.points} pts</div>
                  </div>
                );
              })
            ) : (
              <p className="empty-msg">El catálogo de premios está vacío.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
