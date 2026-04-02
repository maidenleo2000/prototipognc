import { useState, useEffect } from "react";
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch 
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../services/firebase";

/**
 * Hook personalizado para interactuar con productos y usuarios en Firestore.
 * Proporciona métodos para leer, actualizar y eliminar datos en tiempo real.
 */
export const useFirestore = (isAuthenticated, isAdmin) => {
  const [foodProductsState, setFoodProductsState] = useState([]);
  const [autoProductsState, setAutoProductsState] = useState([]);
  const [promosState, setPromosState] = useState([]);
  const [rewardsState, setRewardsState] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [appSettings, setAppSettings] = useState({
    foodCategoryName: 'Comida y Tienda',
    autoCategoryName: 'Automotor'
  });

  useEffect(() => {
    if (!isAuthenticated) return;

    // Escucha en tiempo real para la colección de 'foodProducts'
    const unsubFood = onSnapshot(collection(db, "foodProducts"), 
      (snapshot) => {
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFoodProductsState(prods);
      },
      (error) => console.error("Error en foodProducts snapshot:", error)
    );

    // Escucha en tiempo real para la colección de 'autoProducts'
    const unsubAuto = onSnapshot(collection(db, "autoProducts"), 
      (snapshot) => {
        const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setAutoProductsState(prods);
      },
      (error) => console.error("Error en autoProducts snapshot:", error)
    );

    // Escucha en tiempo real para las promociones diarias
    const unsubPromos = onSnapshot(collection(db, "promotions"), (snapshot) => {
      const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPromosState(p.sort((a,b) => a.day - b.day));
    });

    // Escucha en tiempo real para el catálogo de recompensas
    const unsubRewards = onSnapshot(collection(db, "rewards"), (snapshot) => {
      setRewardsState(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Escucha en tiempo real para ajustes globales
    const unsubSettings = onSnapshot(doc(db, "config", "appSettings"), (docSnap) => {
      if (docSnap.exists()) {
        setAppSettings(docSnap.data());
      }
    });

    // Escucha en tiempo real para todos los usuarios (solo si es administrador)
    let unsubUsers = () => {};
    if (isAdmin) {
      unsubUsers = onSnapshot(collection(db, "users"), 
        (snapshot) => {
          setAllUsers(snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() })));
        },
        (error) => console.error("Error en users snapshot (admin):", error)
      );
    }

    return () => {
      unsubFood();
      unsubAuto();
      unsubPromos();
      unsubRewards();
      unsubUsers();
      unsubSettings();
    };
  }, [isAuthenticated, isAdmin]);

  /**
   * Crear un nuevo producto en la colección correspondiente.
   */
  const handleAddProduct = async (collName, productData) => {
    const newDocRef = doc(collection(db, collName));
    await setDoc(newDocRef, {
      ...productData,
      iconType: productData.iconType || (collName === 'foodProducts' ? 'coffee' : 'wrench'),
      createdAt: new Date().toISOString()
    });
  };

  /**
   * Actualizar el precio de un producto específico.
   */
  const handleUpdatePrice = async (collName, id, field, value) => {
    const docRef = doc(db, collName, id);
    const val = value === "" ? null : Number(value);
    await updateDoc(docRef, { [field]: val });
  };

  /**
   * Eliminar un producto de Firestore.
   */
  const handleDeleteProduct = async (collName, id) => {
    if (window.confirm("¿Estás seguro de eliminar este producto?")) {
      await deleteDoc(doc(db, collName, id));
    }
  };

  /**
   * Actualizar una promoción diaria.
   */
  const handleUpdatePromo = async (id, field, value) => {
    const docRef = doc(db, "promotions", id);
    await updateDoc(docRef, { [field]: field === 'discount' ? Number(value) : value });
  };

  /**
   * Eliminar una promoción de Firestore.
   */
  const handleDeletePromo = async (id) => {
    await deleteDoc(doc(db, "promotions", id));
  };

  /**
   * Gestionar premios (Añadir/Eliminar).
   */
  const handleAddReward = async (rewardData) => {
    const newDocRef = doc(collection(db, "rewards"));
    await setDoc(newDocRef, rewardData);
  };

  const handleDeleteReward = async (id) => {
    await deleteDoc(doc(db, "rewards", id));
  };

  /**
   * Actualizar manualmente los puntos de un usuario.
   */
  const handleUpdateUserPoints = async (uid, newPoints) => {
    const docRef = doc(db, "users", uid);
    await updateDoc(docRef, { points: Number(newPoints) });
  };

  /**
   * Eliminar un perfil de usuario de Firestore.
   */
  const handleDeleteUser = async (uid) => {
    if (window.confirm("¿Seguro que quieres eliminar este usuario?")) {
      await deleteDoc(doc(db, "users", uid));
    }
  };

  /**
   * Crear un nuevo perfil de usuario manualmente.
   */
  const handleAddUser = async (userData) => {
    const newDocRef = doc(collection(db, "users"));
    await setDoc(newDocRef, {
      ...userData,
      createdAt: new Date().toISOString()
    });
  };

  /**
   * Actualizar ajustes globales.
   */
  const updateAppSettings = async (newSettings) => {
    const docRef = doc(db, "config", "appSettings");
    await setDoc(docRef, newSettings, { merge: true });
  };

  /**
   * Subir imagen a Firebase Storage.
   */
  const uploadImage = async (file) => {
    if (!file) return null;
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  /**
   * Inicializar las 7 promociones de la semana por defecto.
   * Utiliza una transacción por lotes (writeBatch) para mayor eficiencia.
   */
  const initWeeklyPromos = async () => {
    try {
      console.log("Iniciando generación de promos semanales...");
      const batch = writeBatch(db);
      const days = [0, 1, 2, 3, 4, 5, 6];
      
      for (const day of days) {
        const docRef = doc(db, "promotions", `day_${day}`);
        batch.set(docRef, {
          day,
          text: `Promoción del día ${day}`,
          discount: 0,
          unit: '% Off'
        });
      }

      await batch.commit();
      console.log("Promociones semanales generadas exitosamente.");
    } catch (error) {
      console.error("Error al inicializar promociones:", error);
      alert("No se pudieron generar las promociones. Verificá los permisos de Firestore.");
    }
  };

  /**
   * Crear una promoción individual si es necesario.
   */
  const handleAddPromo = async (day, text, discount) => {
    try {
      const docRef = doc(db, "promotions", `day_${day}`);
      await setDoc(docRef, { day: Number(day), text, discount: Number(discount) });
    } catch (error) {
      console.error("Error al añadir promoción:", error);
    }
  };

  return {
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
    updateAppSettings,
    uploadImage,
    initWeeklyPromos,
    handleAddPromo,
    handleDeletePromo
  };
};
