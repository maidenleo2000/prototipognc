import React, { useState } from "react";
import { 
  ShoppingBag, 
  Users, 
  Trash2, 
  Plus, 
  Minus,
  Calendar, 
  Gift, 
  Fuel,
  Settings,
  Search,
  Image as ImageIcon,
  Edit3,
  Type,
  Zap,
  Globe,
  Palette,
  ArrowUp,
  RefreshCcw
} from "lucide-react";

const SITIO_ICONS = [
  'fuel', 'zap', 'car', 'wrench', 'coffee', 'shoppingBag', 'navigation', 'wind', 'droplet', 'pizza', 'flame', 'shield', 'heart', 'star', 'home'
];

const AVAILABLE_ICONS = [
  'coffee', 'wrench', 'fuel', 'car', 'utensils', 'shoppingBag', 
  'zap', 'navigation', 'wind', 'droplet', 'water', 'pizza', 
  'burger', 'iceCream', 'sandwich', 'cookie', 'smartphone', 'gift'
];

/**
 * Panel de Administración dinámico.
 * Permite gestionar productos, promociones, premios y usuarios.
 */
const Admin = ({ 
  isAdmin,
  adminTab, 
  setAdminTab, 
  foodProductsState, 
  autoProductsState, 
  promosState,
  rewardsState,
  allUsers, 
  handleAddProduct,
  handleUpdatePrice, 
  handleDeleteProduct,
  handleUpdatePromo,
  handleDeletePromo,
  handleAddReward,
  handleDeleteReward,
  handleUpdateUserPoints, 
  handleDeleteUser,
  handleAddUser,
  handleUpdateUser,
  initWeeklyPromos,
  appSettings,
  updateAppSettings,
  uploadImage,
  getIcon,
  userProfile,
  redemptionsState,
  handleCompleteRedeem
}) => {
  const profileName = userProfile?.name || userProfile?.displayName || userProfile?.email?.split('@')[0] || 'Usuario';
  const [pointsStep, setPointsStep] = useState(10);
  const [userSearch, setUserSearch] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [foodIcon, setFoodIcon] = useState('coffee');
  const [autoIcon, setAutoIcon] = useState('wrench');
  const [foodVisualMode, setFoodVisualMode] = useState('image'); 
  const [autoVisualMode, setAutoVisualMode] = useState('image');
  const [productSubTab, setProductSubTab] = useState('food');
  // Separar usuarios por roles para una mejor organización
  const admins = allUsers.filter(u => u.role === 'admin');
  const clients = allUsers.filter(u => u.role !== 'admin').filter(u => {
    const searchLow = userSearch.toLowerCase();
    const nameLow = (u.name || "").toLowerCase();
    const emailLow = (u.email || "").toLowerCase();
    const displayNameLow = (u.displayName || "").toLowerCase();
    
    return nameLow.includes(searchLow) || 
           emailLow.includes(searchLow) || 
           displayNameLow.includes(searchLow);
  });

  if (!isAdmin) {
    return (
      <div className="admin-view">
        <div className="catalog-header">
          <h2>Mi <span className="highlight">Perfil</span></h2>
          <p>Consultá tu estado y nivel en la estación.</p>
        </div>
        <div className="card-glass profile-info-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <Users size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h3>Bienvenido, {profileName}</h3>
          <p>Como cliente regular, podés ver las promociones vigentes en el catálogo.</p>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>
            Nivel: <strong>Cliente GNC</strong>
          </p>
        </div>
      </div>
    );
  }

  // Manejador para el formulario de nuevo producto
  const onAddProductSubmit = async (e, category) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      const formData = new FormData(e.target);
      const fileInput = e.target.querySelector('input[type="file"]');
      const file = fileInput ? fileInput.files[0] : null;
      let imageUrl = "";

      if (file) {
        imageUrl = await uploadImage(file);
      }

      const product = {
        name: formData.get("name"),
        desc: formData.get("desc"),
        originalPrice: Number(formData.get("originalPrice")),
        promoPrice: formData.get("promoPrice") ? Number(formData.get("promoPrice")) : null,
        imageUrl: category === 'foodProducts' 
          ? (foodVisualMode === 'image' ? imageUrl : "") 
          : (autoVisualMode === 'image' ? imageUrl : ""),
        iconType: category === 'foodProducts' 
          ? (foodVisualMode === 'icon' ? foodIcon : "coffee") 
          : (autoVisualMode === 'icon' ? autoIcon : "wrench")
      };
      await handleAddProduct(category, product);
      e.target.reset();
    } catch (error) {
      console.error("Error al añadir producto:", error);
      alert("Hubo un error al guardar el producto.");
    } finally {
      setIsUploading(false);
    }
  };

  const onUpdateSettingsSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    updateAppSettings({
      foodCategoryName: formData.get("foodCategoryName"),
      autoCategoryName: formData.get("autoCategoryName"),
    });
  };

  const onAddRewardSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    handleAddReward({
      title: formData.get("title"),
      points: Number(formData.get("points")),
    });
    e.target.reset();
  };

  const onAddUserSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    handleAddUser({
      name: formData.get("name"),
      email: formData.get("email"),
      points: Number(formData.get("points")),
      role: formData.get("role"),
    });
    e.target.reset();
  };

  const onUpdateUserSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await handleUpdateUser(editingUser.uid, {
      name: formData.get("name"),
      email: formData.get("email"),
      points: Number(formData.get("points")),
      role: formData.get("role"),
    });
    setEditingUser(null);
  };

  return (
    <div className="admin-view">
      <div className="catalog-header">
        <h2>Panel <span className="highlight">Administrador</span></h2>
        <p>Control total sobre precios, promociones, premios y usuarios.</p>
      </div>

      <div className="category-tabs" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
        <button className={`tab-btn ${adminTab === 'products' ? 'active' : ''}`} onClick={() => setAdminTab('products')}>
          <ShoppingBag size={20} /> Productos
        </button>
        <button className={`tab-btn ${adminTab === 'promos' ? 'active' : ''}`} onClick={() => setAdminTab('promos')}>
          <Calendar size={20} /> Promos
        </button>
        <button className={`tab-btn ${adminTab === 'rewards' ? 'active' : ''}`} onClick={() => setAdminTab('rewards')}>
          <Gift size={20} /> Premios
        </button>
        <button className={`tab-btn ${adminTab === 'redemptions' ? 'active' : ''}`} onClick={() => setAdminTab('redemptions')}>
          <Zap size={20} /> Canjes
        </button>
        <button className={`tab-btn ${adminTab === 'users' ? 'active' : ''}`} onClick={() => setAdminTab('users')}>
          <Users size={20} /> Usuarios
        </button>
        <button className={`tab-btn ${adminTab === 'site' ? 'active' : ''}`} onClick={() => setAdminTab('site')}>
          <Globe size={20} /> Sitio
        </button>
      </div>

      {/* --- GESTIÓN DE PRODUCTOS --- */}
      {adminTab === 'products' && (
        <div className="admin-products-view">
          {/* Configuración de Nombres de Categoría */}
          <div className="admin-section" style={{ marginBottom: '1rem' }}>
             <div className="card-glass" style={{ marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-end', padding: '1.5rem' }}>
                <form onSubmit={onUpdateSettingsSubmit} style={{ display: 'flex', gap: '1rem', flex: 1, flexWrap: 'wrap' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nombre Categoría 1</label>
                    <input name="foodCategoryName" defaultValue={appSettings.foodCategoryName} className="admin-input" style={{ padding: '0.5rem 1rem' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Nombre Categoría 2</label>
                    <input name="autoCategoryName" defaultValue={appSettings.autoCategoryName} className="admin-input" style={{ padding: '0.5rem 1rem' }} />
                  </div>
                  <button type="submit" className="btn-add" style={{ padding: '0.6rem 1.5rem', marginTop: 'auto' }}><Edit3 size={16} /> Guardar Nombres</button>
                </form>
             </div>
          </div>

          {/* Sub-menu para elegir categoría */}
          <div className="category-tabs sub-tabs" style={{ marginBottom: '2rem', justifyContent: 'center' }}>
            <button 
              className={`tab-btn ${productSubTab === 'food' ? 'active' : ''}`} 
              onClick={() => setProductSubTab('food')}
              style={{ padding: '0.5rem 2rem' }}
            >
              {appSettings.foodCategoryName}
            </button>
            <button 
              className={`tab-btn ${productSubTab === 'auto' ? 'active' : ''}`} 
              onClick={() => setProductSubTab('auto')}
              style={{ padding: '0.5rem 2rem' }}
            >
              {appSettings.autoCategoryName}
            </button>
          </div>

          <div className="admin-products-single-col">
            {/* Columna Comida */}
            {productSubTab === 'food' && (
              <div className="admin-section fade-in">
                <div className="section-header-admin">
                  <h3>{appSettings.foodCategoryName}</h3>
                </div>
                <form className="card-glass add-form" onSubmit={(e) => onAddProductSubmit(e, "foodProducts")}>
                  <input name="name" placeholder="Nombre" required />
                  <input name="desc" placeholder="Descripción" />
                  <div className="price-inputs">
                    <input name="originalPrice" type="number" placeholder="Original" required />
                    <input name="promoPrice" type="number" placeholder="Promo (Opcional)" />
                  </div>
                  <div className="visual-mode-toggle">
                    <button type="button" className={`toggle-tab ${foodVisualMode === 'image' ? 'active' : ''}`} onClick={() => setFoodVisualMode('image')}><ImageIcon size={16} /> Imagen</button>
                    <button type="button" className={`toggle-tab ${foodVisualMode === 'icon' ? 'active' : ''}`} onClick={() => setFoodVisualMode('icon')}><Type size={16} /> Icono</button>
                  </div>

                  {foodVisualMode === 'image' ? (
                    <div className="file-upload" style={{ margin: '0.5rem 0' }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '10px', border: '1px dashed var(--border)' }}>
                        <ImageIcon size={18} /> Subir Imagen
                        <input type="file" accept="image/*" style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <div className="icon-selector-grid">
                      {AVAILABLE_ICONS.map(icon => (
                        <button 
                          key={icon} 
                          type="button" 
                          className={`icon-option ${foodIcon === icon ? 'active' : ''}`}
                          onClick={() => setFoodIcon(icon)}
                          title={icon}
                        >
                          {getIcon(icon, 18)}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <button type="submit" className="btn-add" disabled={isUploading}>
                    {isUploading ? "Subiendo..." : <><Plus size={18} /> Añadir</>}
                  </button>
                </form>
                <div className="admin-items-list">
                  {foodProductsState.map((prod) => (
                    <div key={prod.id} className="card-glass admin-item-card">
                      <div className="item-main">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                              {getIcon(prod.iconType, 20)}
                            </div>
                          )}
                          <strong>{prod.name}</strong>
                        <button className="del-text" onClick={() => handleDeleteProduct("foodProducts", prod.id)}><Trash2 size={14}/></button>
                      </div>
                      <div className="admin-price-controls">
                        <input type="number" defaultValue={prod.originalPrice} onBlur={(e) => handleUpdatePrice("foodProducts", prod.id, "originalPrice", e.target.value)} />
                        <input type="number" defaultValue={prod.promoPrice} onBlur={(e) => handleUpdatePrice("foodProducts", prod.id, "promoPrice", e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Columna Automotor */}
            {productSubTab === 'auto' && (
              <div className="admin-section fade-in">
                <h3>{appSettings.autoCategoryName}</h3>
                <form className="card-glass add-form" onSubmit={(e) => onAddProductSubmit(e, "autoProducts")}>
                  <input name="name" placeholder="Nombre" required />
                  <input name="desc" placeholder="Descripción" />
                  <div className="price-inputs">
                    <input name="originalPrice" type="number" placeholder="Original" required />
                    <input name="promoPrice" type="number" placeholder="Promo (Opcional)" />
                  </div>
                  <div className="visual-mode-toggle">
                    <button type="button" className={`toggle-tab ${autoVisualMode === 'image' ? 'active' : ''}`} onClick={() => setAutoVisualMode('image')}><ImageIcon size={16} /> Imagen</button>
                    <button type="button" className={`toggle-tab ${autoVisualMode === 'icon' ? 'active' : ''}`} onClick={() => setAutoVisualMode('icon')}><Type size={16} /> Icono</button>
                  </div>

                  {autoVisualMode === 'image' ? (
                    <div className="file-upload" style={{ margin: '0.5rem 0' }}>
                      <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '10px', border: '1px dashed var(--border)' }}>
                        <ImageIcon size={18} /> Subir Imagen
                        <input type="file" accept="image/*" style={{ display: 'none' }} />
                      </label>
                    </div>
                  ) : (
                    <div className="icon-selector-grid">
                      {AVAILABLE_ICONS.map(icon => (
                        <button 
                          key={icon} 
                          type="button" 
                          className={`icon-option ${autoIcon === icon ? 'active' : ''}`}
                          onClick={() => setAutoIcon(icon)}
                          title={icon}
                        >
                          {getIcon(icon, 18)}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <button type="submit" className="btn-add" disabled={isUploading}>
                    {isUploading ? "Subiendo..." : <><Plus size={18} /> Añadir</>}
                  </button>
                </form>
                <div className="admin-items-list">
                  {autoProductsState.map((prod) => (
                    <div key={prod.id} className="card-glass admin-item-card">
                      <div className="item-main">
                          {prod.imageUrl ? (
                            <img src={prod.imageUrl} style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center' }}>
                              {getIcon(prod.iconType, 20)}
                            </div>
                          )}
                          <strong>{prod.name}</strong>
                        <button className="del-text" onClick={() => handleDeleteProduct("autoProducts", prod.id)}><Trash2 size={14}/></button>
                      </div>
                      <div className="admin-price-controls">
                        <input type="number" defaultValue={prod.originalPrice} onBlur={(e) => handleUpdatePrice("autoProducts", prod.id, "originalPrice", e.target.value)} />
                        <input type="number" defaultValue={prod.promoPrice} onBlur={(e) => handleUpdatePrice("autoProducts", prod.id, "promoPrice", e.target.value)} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- GESTIÓN DE PROMOS --- */}
      {adminTab === 'promos' && (
        <div className="admin-section">
          <div className="section-header-admin">
            <h3>Promociones Semanales</h3>
            {promosState.length < 7 && (
              <button className="btn-add" onClick={initWeeklyPromos}>
                <Calendar size={18} /> Generar Semana Completa
              </button>
            )}
          </div>
          <div className="admin-items-list">
            {promosState.map((promo) => {
              const isToday = promo.day === new Date().getDay();
              return (
                <div key={promo.id} className={`card-glass admin-item-card promo-edit-row ${isToday ? 'promo-today-active' : ''}`}>
                  <span className="day-label">
                    {["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"][promo.day]}
                    {isToday && <div className="today-dot"></div>}
                  </span>
                  <input style={{ flex: 2 }} defaultValue={promo.text} onBlur={(e) => handleUpdatePromo(promo.id, "text", e.target.value)} placeholder="Ej: 10% Off en Carga" />
                  <div className="discount-input">
                    <input type="number" defaultValue={promo.discount} onBlur={(e) => handleUpdatePromo(promo.id, "discount", e.target.value)} />
                    <select 
                      defaultValue={promo.unit || '% Off'} 
                      onChange={(e) => handleUpdatePromo(promo.id, "unit", e.target.value)}
                      className="unit-select"
                    >
                      <option value="% Off">% Off</option>
                      <option value="Pts Extra">Pts Extra</option>
                      <option value="x2">x2</option>
                      <option value="Pts">Pts</option>
                    </select>
                  </div>
                  <button className="del-btn" onClick={() => handleDeletePromo(promo.id)} title="Eliminar promo">
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })}
            {promosState.length === 0 && <p className="empty-msg">No hay promociones. Hacé clic en "Generar Semana Completa".</p>}
          </div>
        </div>
      )}

      {/* --- GESTIÓN DE PREMIOS --- */}
      {adminTab === 'rewards' && (
        <div className="admin-section">
          <h3>Catálogo de Premios</h3>
          <form className="card-glass add-form" onSubmit={onAddRewardSubmit}>
            <input name="title" placeholder="Título del premio" required />
            <input name="points" type="number" placeholder="Puntos necesarios" required />
            <button type="submit" className="btn-add"><Plus size={18} /> Añadir Premio</button>
          </form>
          <div className="admin-items-list">
            {rewardsState.map((reward) => (
              <div key={reward.id} className="card-glass admin-item-card">
                <div className="item-main">
                  <span>{reward.title} - <strong>{reward.points} pts</strong></span>
                  <button className="btn-icon btn-danger" onClick={() => handleDeleteReward(reward.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- GESTIÓN DE USUARIOS --- */}
      {adminTab === 'users' && (
        <div className="admin-users-list">
          {/* Formulario Nuevo Usuario */}
          <div className="admin-section">
            <h3>Nuevo Usuario</h3>
            <form className="card-glass add-form" onSubmit={onAddUserSubmit} style={{ marginBottom: '2rem' }}>
              <input name="name" placeholder="Nombre completo" required />
              <input name="email" type="email" placeholder="Email del usuario" required />
              <div className="price-inputs">
                <input name="points" type="number" placeholder="Puntos Iniciales" defaultValue={0} required />
                <select name="role" style={{ background: 'rgba(0,0,0,0.3)', color: 'white', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.5rem' }}>
                  <option value="client">Cliente</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <button type="submit" className="btn-add"><Plus size={18} /> Crear Usuario</button>
            </form>
          </div>


          <div className="admin-section">
            <h3>Administradores</h3>
            <div className="card-glass users-table-container">
              <table className="admin-table">
                <thead><tr><th>Email</th><th>Acciones</th></tr></thead>
                <tbody>
                  {admins.map((u) => (
                    <tr key={u.uid}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: '600' }}>{u.displayName || u.name || 'Admin'}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{u.email}</span>
                        </div>
                      </td>
                      <td><button className="btn-icon btn-danger" onClick={() => handleDeleteUser(u.uid)}><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="admin-section" style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3>Clientes y Usuarios</h3>
              <div className="search-bar" style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%', maxWidth: '300px' }}>
                <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar por nombre o email..." 
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="admin-input"
                  style={{ paddingLeft: '2.8rem' }}
                />
              </div>
            </div>

            {/* Configuración Global de Puntos Relocalizada */}
            <div className="card-glass points-config-card" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Settings className="section-icon" size={20} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Incremento por Click</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configurá cuánto suma/resta el + y -</p>
                </div>
              </div>
              <div className="admin-price-controls">
                <input 
                  type="number" 
                  value={pointsStep} 
                  onChange={(e) => setPointsStep(Number(e.target.value))} 
                  style={{ width: '80px', textAlign: 'center', fontSize: '1.1rem', color: 'var(--primary)', padding: '0.4rem' }}
                />
              </div>
            </div>

            <div className="admin-users-grid-container">
               {clients.map((u) => (
                 <div key={u.uid} className="card-glass user-profile-row">
                    <div className="user-primary-info">
                       <div className="user-avatar-small">{getIcon('users', 18)}</div>
                       <div className="name-email">
                          <strong>{u.name || u.displayName || 'Sin nombre'}</strong>
                          <span>{u.email}</span>
                       </div>
                    </div>

                    <div className="user-score-section">
                       <div className="points-controls">
                          <button 
                            className="btn-icon btn-minus-active" 
                            onClick={() => handleUpdateUserPoints(u.uid, Math.max(0, (u.points || 0) - pointsStep))}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="points-display">
                            {u.points || 0} <small>pts</small>
                          </span>
                          <button 
                            className="btn-icon btn-plus-active" 
                            onClick={() => handleUpdateUserPoints(u.uid, (u.points || 0) + pointsStep)}
                          >
                            <Plus size={14} />
                          </button>
                       </div>
                    </div>

                    <div className="user-row-actions">
                       <button className="btn-icon" onClick={() => setEditingUser(u)} title="Editar"><Edit3 size={16} /></button>
                       <button className="btn-icon btn-danger" onClick={() => handleDeleteUser(u.uid)} title="Eliminar"><Trash2 size={16} /></button>
                    </div>
                 </div>
               ))}
               {clients.length === 0 && <p className="empty-msg">No se encontraron usuarios.</p>}
            </div>
          </div>
        </div>
      )}
      {adminTab === 'redemptions' && (
        <div className="admin-section">
          <h3>Canjes Pendientes</h3>
          <p className="section-subtitle">Aprobá las solicitudes de premios de los clientes.</p>
          <div className="admin-users-grid-container" style={{ marginTop: '1.5rem' }}>
            {redemptionsState?.filter(r => r.status === 'pending').map((r) => {
              const u = allUsers.find(user => user.uid === r.userId);
              return (
                <div key={r.id} className="card-glass user-profile-row" style={{ borderLeft: '4px solid #2979ff' }}>
                  <div className="user-primary-info">
                    <div className="user-avatar-small"><Gift size={20} /></div>
                    <div className="name-email">
                      <strong>{r.rewardTitle}</strong>
                      <span>Cliente: {u?.name || u?.email || 'Usuario Desconocido'}</span>
                    </div>
                  </div>
                  <div className="user-score-section">
                    <span className="points-display" style={{ fontSize: '1rem', color: '#888' }}>
                      -{r.pointsDeducted} pts
                    </span>
                  </div>
                  <div className="user-row-actions">
                    <button className="btn-primary" onClick={() => handleCompleteRedeem(r.id)} style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
                      Completar
                    </button>
                  </div>
                </div>
              );
            })}
            {redemptionsState?.filter(r => r.status === 'pending').length === 0 && (
              <div className="card-glass" style={{ textAlign: 'center', padding: '3rem' }}>
                <p className="empty-msg">No hay solicitudes de canje pendientes en este momento.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {adminTab === 'site' && (
        <div className="admin-section fade-in">
          <div className="section-header-admin">
            <h3>Personalización del Sitio</h3>
            <p>Ajustá la identidad visual y funcionalidades globales.</p>
          </div>

          <div className="card-glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Nombre e Icono */}
            <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div className="setting-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Nombre del Sitio</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input 
                    className="admin-input" 
                    value={appSettings.siteName || 'EkoGNC'} 
                    onChange={(e) => updateAppSettings({ siteName: e.target.value })}
                    placeholder="Nombre que aparece arriba"
                  />
                  <button className="btn-icon" onClick={() => updateAppSettings({ siteName: 'EkoGNC', siteIcon: 'fuel' })} title="Restablecer Nombre e Icono">
                    <RefreshCcw size={18} />
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Icono del Sitio</label>
                <div className="icon-selector-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem' }}>
                  {SITIO_ICONS.map(icon => (
                    <button 
                      key={icon} 
                      type="button" 
                      className={`icon-option ${appSettings.siteIcon === icon ? 'active' : ''}`}
                      onClick={() => updateAppSettings({ siteIcon: icon })}
                    >
                      {getIcon(icon, 20)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '1rem 0' }} />

            {/* Colores y Mas */}
            <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <div className="setting-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Color Principal (Tema)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <input 
                    type="color" 
                    value={appSettings.primaryColor || '#00e676'} 
                    onChange={(e) => updateAppSettings({ primaryColor: e.target.value })}
                    style={{ border: 'none', width: '60px', height: '40px', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
                  />
                  <span style={{ fontFamily: 'monospace' }}>{appSettings.primaryColor || '#00e676'}</span>
                  <button 
                    className="btn-add" 
                    style={{ background: '#00e676', border: 'none' }}
                    onClick={() => updateAppSettings({ primaryColor: '#00e676' })}
                  >
                    Restablecer
                  </button>
                </div>
              </div>

              <div className="setting-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>Funcionalidades</label>
                <div className="card-glass" style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ArrowUp size={20} color="var(--primary)" />
                    <span>Botón "Volver Arriba"</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={appSettings.showScrollTop} 
                      onChange={(e) => updateAppSettings({ showScrollTop: e.target.checked })}
                    />
                    <span className="slider round"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE EDICIÓN DE USUARIO */}
      <div className={`modal-overlay ${editingUser ? 'active' : ''}`}>
        <div className="modal-content card-glass">
            <h3>Editar Usuario</h3>
            <p className="modal-text">Modificá los datos del perfil seleccionado.</p>
            {editingUser && (
              <form onSubmit={onUpdateUserSubmit} className="login-form">
                <div className="input-group">
                  <input name="name" className="input-field" defaultValue={editingUser.name || editingUser.displayName} placeholder="Nombre" required />
                </div>
                <div className="input-group">
                  <input name="email" className="input-field" defaultValue={editingUser.email} placeholder="Email" required />
                </div>
                <div className="input-group">
                   <input name="points" className="input-field" type="number" defaultValue={editingUser.points || 0} placeholder="Puntos" required />
                </div>
                <div className="input-group">
                  <select name="role" defaultValue={editingUser.role || 'client'} className="input-field">
                    <option value="client">Cliente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
                  <button type="button" className="btn-close" onClick={() => setEditingUser(null)} style={{ flex: 1 }}>Cerrar</button>
                </div>
              </form>
            )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
