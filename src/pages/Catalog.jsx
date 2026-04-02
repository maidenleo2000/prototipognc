import React from "react";
import { Coffee, Wrench } from "lucide-react";

/**
 * Página de Catálogo con las promociones actuales de precios.
 * Permite filtrar productos por categoría y ver sus precios.
 */
const Catalog = ({ 
  activeCategory, 
  setActiveCategory, 
  foodProductsState, 
  autoProductsState, 
  getIcon,
  appSettings 
}) => {
  // Asegurar que si los settings aún no cargaron, mostramos valores por defecto
  const foodName = appSettings?.foodCategoryName || "Comida y Tienda";
  const autoName = appSettings?.autoCategoryName || "Automotor";
  return (
    <div className="catalog-view">
      <div className="catalog-header">
        <h2>Catálogo de <span className="highlight">Promociones</span></h2>
        {/* Descripción informando que los descuentos se aplican en todas las categorías */}
        <p>Aprovechá nuestros descuentos exclusivos en ambos sectores usando tus puntosGNC.</p>
      </div>
      
      {/* Sistema de tabs para elegir sector de la tienda */}
      <div className="category-tabs">
        <button 
          className={`tab-btn ${activeCategory === 'comida' ? 'active' : ''}`}
          onClick={() => setActiveCategory('comida')}
        >
          <Coffee size={20} />
          {foodName}
        </button>
        <button 
          className={`tab-btn ${activeCategory === 'automotor' ? 'active' : ''}`}
          onClick={() => setActiveCategory('automotor')}
        >
          <Wrench size={20} />
          {autoName}
        </button>
      </div>

      {/* Grid de productos que cambia según la categoría activa */}
      <div className="products-grid">
        {(activeCategory === 'comida' ? foodProductsState : autoProductsState).map((product) => (
          <div key={product.id} className="card-glass product-card">
            {/* Si el producto tiene imagen cargada por admin, la mostramos */}
            {product.imageUrl ? (
               <div style={{ width: '100%', height: '140px', marginBottom: '1rem', overflow: 'hidden', borderRadius: '16px' }}>
                  <img src={product.imageUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={product.name} />
               </div>
            ) : (
               <div className="product-icon">{getIcon(product.iconType)}</div>
            )}
            <div className="product-info">
              <h3>{product.name}</h3>
              <p>{product.desc}</p>
            </div>
            {/* Visualización de precios tachado (original) y destacado (promo) */}
            <div className="product-price">
              {product.promoPrice ? (
                <>
                  <span className="price-old">${product.originalPrice}</span>
                  <span className="price-new">${product.promoPrice}</span>
                </>
              ) : (
                <div className="price-new">${product.originalPrice}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Catalog;
