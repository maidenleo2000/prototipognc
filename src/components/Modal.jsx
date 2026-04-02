import React from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Modal de Éxito genérico.
 * Se utiliza para informar cargas de puntos o redenciones exitosas.
 */
const Modal = ({ show, title, message, onClose }) => {
  return (
    <div className={`modal-overlay ${show ? "active" : ""}`}>
      {/* Contenido del modal con animación de entrada */}
      <div className="modal-content">
        {/* Check animado de éxito */}
        <CheckCircle2 className="modal-icon" size={48} />
        <h2 className="modal-title">{title}</h2>
        <p className="modal-text">{message}</p>
        <button className="btn-close" onClick={onClose}>
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Modal;
