import { useState, useEffect } from "react";
import { onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";

/**
 * Hook personalizado para gestionar la autenticación y el perfil del usuario en Firestore.
 * Proporciona el estado de autenticación, perfil del usuario, puntos y si es administrador.
 */
export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubUser = null;

    // Suscribirse a los cambios de estado de autenticación de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Limpiar suscripción previa de Firestore si existía
      if (unsubUser) {
        unsubUser();
        unsubUser = null;
      }

      if (user) {
        setIsAuthenticated(true);
        
        // Escuchar cambios en el documento del usuario en Firestore en tiempo real
        const userDocRef = doc(db, "users", user.uid);
        unsubUser = onSnapshot(userDocRef, 
          async (docSnap) => {
            try {
              if (docSnap.exists()) {
                const data = docSnap.data();
                
                // --- LÓGICA DE AUTO-PROMOCIÓN PARA LA CUENTA ADMIN ---
                if (user.email === "admin@test.com" && data.role !== "admin") {
                  await updateDoc(userDocRef, { role: "admin" });
                }

                setUserProfile({ uid: user.uid, ...data });
                setPoints(data.points || 0);
                setIsAdmin(data.role === "admin");
              } else {
                // Si el perfil no existe, crearlo con valores predeterminados (primer inicio de sesión)
                const isAdminEmail = user.email === "admin@test.com";
                const newUser = {
                  email: user.email,
                  points: isAdminEmail ? 0 : 120, // Administradores no tienen puntos
                  role: isAdminEmail ? "admin" : "client",
                  createdAt: new Date().toISOString(),
                };
                await setDoc(userDocRef, newUser);
                setUserProfile({ uid: user.uid, ...newUser });
                setPoints(newUser.points);
                setIsAdmin(isAdminEmail);
              }
            } catch (err) {
              console.error("Error procesando perfil de usuario:", err);
            } finally {
              setLoading(false);
            }
          },
          (error) => {
            console.error("Error en onSnapshot de usuario:", error);
            setLoading(false); 
          }
        );
      } else {
        // Usuario no autenticado, resetear estados
        setIsAuthenticated(false);
        setUserProfile(null);
        setIsAdmin(false);
        setPoints(0);
        setLoading(false);
      }
    }, (error) => {
      console.error("Error en onAuthStateChanged:", error);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      if (unsubUser) unsubUser();
    };
  }, []);

  const handleResetPassword = async () => {
    if (!userProfile?.email) return;
    try {
      await sendPasswordResetEmail(auth, userProfile.email);
      return true;
    } catch (error) {
      console.error("Error al enviar email de reset:", error);
      throw error;
    }
  };

  return { isAuthenticated, isAdmin, userProfile, points, loading, handleResetPassword };
};
