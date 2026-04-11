import React, { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { 
  Coffee, 
  Wrench, 
  Fuel, 
  Car, 
  Utensils, 
  ShoppingBag, 
  Zap, 
  Navigation,
  Wind,
  Droplet,
  GlassWater,
  Pizza,
  Utensils as BurgerIcon,
  IceCream,
  Sandwich,
  Cookie,
  Smartphone,
  Gift,
  Flame,
  Shield,
  Heart,
  Star,
  Home as HomeIcon,
  RefreshCcw,
  Globe,
  Palette,
  ArrowUp
} from "lucide-react";
import { auth } from "./services/firebase";

// Hooks personalizados - Lógica de negocio extraída
import { useAuth } from "./hooks/useAuth";
import { useFirestore } from "./hooks/useFirestore";

// Componentes modulares - Interfaz refinada
import Header from "./components/Header";
import Login from "./components/Login";
import Modal from "./components/Modal";

// Páginas - Vistas principales de la aplicación
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Admin from "./pages/Admin";

const weekDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

function App() {
  
  // --- Estados de Autenticación y Datos de Firestore (Vía Hooks) ---
  const { isAuthenticated, isAdmin, userProfile, points, loading, handleResetPassword } = useAuth();
  const { 
    foodProductsState, 
    autoProductsState, 
    promosState,
    rewardsState,
    allUsers, 
    appSettings,
    handleAddProduct,
    handleUpdatePrice, 
    handleDeleteProduct,
    handleUpdatePromo,
    handleAddReward,
    handleDeleteReward,
    handleUpdateUserPoints, 
    handleDeleteUser,
    handleAddUser,
    handleUpdateUser,
    initWeeklyPromos,
    handleAddPromo,
    handleDeletePromo,
    updateAppSettings,
    uploadImage,
    redemptionsState,
    handleRequestRedeem,
    handleCompleteRedeem
  } = useFirestore(isAuthenticated, isAdmin);

  // --- Estados de Control Local (Navegación e Interfaz) ---
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loginError, setLoginError] = useState("");
  const [currentView, setCurrentView] = useState("home"); // home, catalog, admin
  const [activeCategory, setActiveCategory] = useState("comida");
  const [adminTab, setAdminTab] = useState("products");
  const [modalData, setModalData] = useState({ show: false, title: "", message: "" });

  const currentDay = new Date().getDay();

  // --- Efecto para aplicar tema de color dinámico ---
  React.useEffect(() => {
    if (appSettings?.primaryColor) {
      document.documentElement.style.setProperty('--primary', appSettings.primaryColor);
      // Generar un glow suave basado en el color primario (vía hex a rgba aprox)
      document.documentElement.style.setProperty('--primary-glow', `${appSettings.primaryColor}4D`); // 4D es 30% alpha
    }
  }, [appSettings?.primaryColor]);

  // --- Manejo del botón Volver Arriba ---
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  React.useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Lógica de Manejo de Sesión ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, loginForm.email, loginForm.password);
      setLoginError("");
    } catch (error) {
      console.error(error);
      setLoginError("Error al iniciar sesión. Verifica tus credenciales.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setLoginForm({ email: "", password: "" });
      setCurrentView("home");
    } catch (error) {
      console.error(error);
    }
  };

  // --- Lógica de Negocio Adaptada a Componentes ---
  const handleRedeem = async (reward) => {
    if ((points || 0) < reward.points) {
      setModalData({
        show: true,
        title: "Puntos Insuficientes",
        message: `Necesitás ${reward.points} puntos para ${reward.title}.`
      });
      return;
    }

    try {
      await handleRequestRedeem(userProfile.uid, points, reward);
      setModalData({
        show: true,
        title: "Puntos en Gestión",
        message: `¡Canje solicitado! Descontamos ${reward.points} puntos. Presentate en caja para retirar tu premio.`
      });
    } catch (error) {
      setModalData({
        show: true,
        title: "Error",
        message: "No se pudo procesar el canje."
      });
    }
  };

  const getIcon = (type, size = 32) => {
    const icons = {
      coffee: <Coffee size={size} />,
      wrench: <Wrench size={size} />,
      fuel: <Fuel size={size} />,
      car: <Car size={size} />,
      utensils: <Utensils size={size} />,
      shoppingBag: <ShoppingBag size={size} />,
      zap: <Zap size={size} />,
      navigation: <Navigation size={size} />,
      wind: <Wind size={size} />,
      droplet: <Droplet size={size} />,
      water: <GlassWater size={size} />,
      pizza: <Pizza size={size} />,
      burger: <BurgerIcon size={size} />,
      iceCream: <IceCream size={size} />,
      sandwich: <Sandwich size={size} />,
      cookie: <Cookie size={size} />,
      smartphone: <Smartphone size={size} />,
      gift: <Gift size={size} />,
      flame: <Flame size={size} />,
      shield: <Shield size={size} />,
      heart: <Heart size={size} />,
      star: <Star size={size} />,
      home: <HomeIcon size={size} />,
    };
    return icons[type] || <ShoppingBag size={size} />;
  };

  if (loading) {
    return (
      <div className="login-wrapper">
        <div className="loading-spinner">Cargando energía...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Login 
        loginForm={loginForm} 
        setLoginForm={setLoginForm} 
        handleLogin={handleLogin} 
        loginError={loginError} 
      />
    );
  }

  return (
    <div className="app-container">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        isAdmin={isAdmin}
        points={points} 
        userProfile={userProfile}
        handleLogout={handleLogout}
        appSettings={appSettings}
        getIcon={getIcon}
      />

      <main className="main-content">
        {currentView === "home" && (
          <Home 
            points={points}
            isAdmin={isAdmin}
            currentDay={currentDay}
            promosData={promosState}
            weekDays={weekDays}
            rewardsCatalogue={rewardsState}
            handleRedeem={handleRedeem}
            appSettings={appSettings}
            redemptionsState={redemptionsState}
            userProfile={userProfile}
          />
        )}

        {currentView === "catalog" && (
          <Catalog 
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            foodProductsState={foodProductsState}
            autoProductsState={autoProductsState}
            getIcon={getIcon}
            appSettings={appSettings}
          />
        )}

        {currentView === "admin" && (
          <Admin 
            isAdmin={isAdmin}
            adminTab={adminTab}
            setAdminTab={setAdminTab}
            foodProductsState={foodProductsState}
            autoProductsState={autoProductsState}
            promosState={promosState}
            rewardsState={rewardsState}
            allUsers={allUsers}
            appSettings={appSettings}
            handleAddProduct={handleAddProduct}
            handleUpdatePrice={handleUpdatePrice}
            handleDeleteProduct={handleDeleteProduct}
            handleUpdatePromo={handleUpdatePromo}
            handleAddReward={handleAddReward}
            handleDeleteReward={handleDeleteReward}
            handleUpdateUserPoints={handleUpdateUserPoints}
            handleDeleteUser={handleDeleteUser}
            handleAddUser={handleAddUser}
            handleUpdateUser={handleUpdateUser}
            initWeeklyPromos={initWeeklyPromos}
            handleAddPromo={handleAddPromo}
            handleDeletePromo={handleDeletePromo}
            updateAppSettings={updateAppSettings}
            uploadImage={uploadImage}
            getIcon={getIcon}
            userProfile={userProfile}
            redemptionsState={redemptionsState}
            handleCompleteRedeem={handleCompleteRedeem}
            handleResetPassword={handleResetPassword}
          />
        )}
      </main>

      <Modal 
        show={modalData.show} 
        title={modalData.title} 
        message={modalData.message} 
        onClose={() => setModalData({ ...modalData, show: false })}
      />

      {/* Botón Volver Arriba Dinámico */}
      {appSettings?.showScrollTop && showScrollBtn && (
        <button 
          className="scroll-to-top" 
          onClick={scrollToTop}
          title="Volver arriba"
        >
          <ArrowUp size={28} color="white" strokeWidth={3} />
        </button>
      )}
    </div>
  );
}

export default App;
