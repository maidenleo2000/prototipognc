import React from "react";
import { Fuel, Lock, User as UserIcon } from "lucide-react";

/**
 * Vista de Inicio de Sesión / Registro Automático.
 * Card con diseño de cristal (glassmorphism) y visualización de credenciales de prueba.
 */
const Login = ({ loginForm, setLoginForm, handleLogin, loginError }) => {
  return (
    <div className="app-container login-wrapper">
      <div className="login-card card-glass">
        {/* Encabezado del Login con ícono principal animado */}
        <div className="login-header">
          <Fuel className="logo-icon" size={48} />
          <h2>
            Bienvenido a <span className="highlight">EkoGNC</span>
          </h2>
          <p>Ingresa tus datos para continuar</p>
        </div>

        {/* Formulario de Login */}
        <form className="login-form" onSubmit={handleLogin}>
          {/* Grupo de Email */}
          <div className="input-group">
            <UserIcon className="input-icon" size={20} />
            <label htmlFor="email" style={{ display: 'none' }}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              placeholder="Correo Electrónico"
              className="input-field"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
            />
          </div>
          {/* Grupo de Contraseña */}
          <div className="input-group">
            <Lock className="input-icon" size={20} />
            <label htmlFor="password" style={{ display: 'none' }}>Contraseña</label>
            <input
              type="password"
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Contraseña"
              className="input-field"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
            />
          </div>
          {/* Visualización de errores informando problemas de credenciales */}
          {loginError && <div className="error-message">{loginError}</div>}
          <button type="submit" className="btn-primary login-btn">
            Iniciar Sesión
          </button>
        </form>

        {/* Credenciales mock para facilitar el testing del usuario */}
        <div className="mock-credentials">
          Usuario: test@test.com Clave: test123.
        </div>
      </div>
    </div>
  );
};

export default Login;
