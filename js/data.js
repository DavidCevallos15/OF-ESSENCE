import { db, storage } from './firebase-config.js';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-storage.js";

const COLLECTION_NAME = 'products';
const DB_CART_KEY = 'off_essence_cart';

// --- Productos (Firestore + Storage) ---

async function uploadImageToStorage(base64Image) {
    if (!base64Image || !base64Image.startsWith('data:image')) {
        return base64Image; // Retorna tal cual si es URL o null
    }

    try {
        // Crear nombre único basado en timestamp
        const fileName = `products/${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
        const storageRef = ref(storage, fileName);
        
        // Subir string base64
        await uploadString(storageRef, base64Image, 'data_url');
        
        // Obtener URL pública
        const downloadURL = await getDownloadURL(storageRef);
        console.log("Imagen subida correctamente:", downloadURL);
        return downloadURL;
        
    } catch (error) {
        console.error("Error subiendo imagen a Storage:", error);
        // Si falla Storage, lanzamos error para avisar al usuario
        // O retornamos el base64 como fallback (arriesgado para Firestore)
        throw new Error("No se pudo subir la imagen. Verifica tu conexión o intenta con una imagen más pequeña.");
    }
}

export async function getProducts() {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        // Si no hay productos, intentamos 'sembrar' la base de datos con los defaultProducts
        if (products.length === 0) {
           console.log('Base de datos vacía, subiendo productos por defecto...');
           await seedDefaultProducts();
           // Devolvemos el array por defecto para visualización inmediata
           return defaultProducts; 
        }

        return products;
    } catch (error) {
        console.error("Error obteniendo productos: ", error);
        return [];
    }
}

export async function addProduct(product) {
    try {
        // 1. Subir imagen si es necesario
        if (product.image && product.image.startsWith('data:image')) {
            console.log("Subiendo imagen para nuevo producto...");
            product.image = await uploadImageToStorage(product.image);
        }

        // 2. Guardar en Firestore
        const docRef = await addDoc(collection(db, COLLECTION_NAME), product);
        console.log("Producto escrito con ID: ", docRef.id);
        return docRef.id;
    } catch (e) {
        console.error("Error añadiendo producto: ", e);
        throw e;
    }
}

export async function updateProduct(id, data) {
    try {
        // 1. Subir imagen si cambió (es base64)
        if (data.image && data.image.startsWith('data:image')) {
             console.log("Subiendo nueva imagen para producto existente...");
             data.image = await uploadImageToStorage(data.image);
        }

        // 2. Actualizar Firestore
        const productRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(productRef, data);
        console.log("Producto actualizado");
    } catch (e) {
        console.error("Error actualizando producto: ", e);
        throw e;
    }
}

export async function deleteProductFromDB(id) {
    try {
        // Opcional: Podríamos también borrar la imagen de Storage aquí si tuviéramos la URL y
        // pudiéramos extraer el path, pero por ahora solo borramos el registro.
        await deleteDoc(doc(db, COLLECTION_NAME, id));
        console.log("Producto eliminado");
    } catch (e) {
        console.error("Error eliminando producto: ", e);
        throw e;
    }
}

// --- Seed Data ---
const defaultProducts = [
    {
        name: 'Noir Éternel',
        description: 'Una mezcla profunda y oscura de oud, ámbar y especias orientales. Perfecto para la noche.',
        image: 'https://images.unsplash.com/photo-1594035919831-f1115b8dfacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHw0fHxwZXJmdW1lfGVufDB8fHx8MTcxMTMwMTY2N3ww&ixlib=rb-4.0.3&q=80&w=600',
        stock: 50
    },
    {
        name: 'Aura Blanche',
        description: 'Floral luminoso con notas de jazmín puro, lirio del valle y almizcle blanco sedoso.',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHwyfHxwZXJmdW1lfGVufDB8fHx8MTcxMTMwMTY2N3ww&ixlib=rb-4.0.3&q=80&w=600',
        stock: 35
    },
    {
        name: 'Santal Impérial',
        description: 'Poderoso sándalo de la india, maderas preciosas y destellos de bergamota. Refinamiento puro.',
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHw3fHxwZXJmdW1lfGVufDB8fHx8MTcxMTMwMTY2N3ww&ixlib=rb-4.0.3&q=80&w=600',
        stock: 20
    },
    {
        name: 'Rose d\'Or',
        description: 'Rosas turcas aterciopeladas en un abrazo de vainilla dorada y maderas ahumadas.',
        image: 'https://images.unsplash.com/photo-1594035919623-a26189cd2e6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHw5fHxwZXJmdW1lfGVufDB8fHx8MTcxMTMwMTY2N3ww&ixlib=rb-4.0.3&q=80&w=600',
        stock: 12
    },
    {
        name: 'Vétiver Privé',
        description: 'El frescor terroso del vetiver haitiano combinado con cítricos vibrantes y pimienta rosa.',
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHwxMnx8cGVyZnVtZXxlbnwwfHx8fDE3MTEzMDE2Njd8MA&ixlib=rb-4.0.3&q=80&w=600',
        stock: 5
    },
    {
        name: 'Luminous',
        description: 'Exquisita combinación de manzana verde, cítricos y maderas nobles. Frescura absoluta.',
        image: 'https://images.unsplash.com/photo-1608682057912-1ce80e14cb7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHwyM3x8cGVyZnVtZXxlbnwwfHx8fDE3MTEzMDU3OTl8MA&ixlib=rb-4.0.3&q=80&w=600',
        stock: 40
    }
];

async function seedDefaultProducts() {
    for (const p of defaultProducts) {
        await addDoc(collection(db, COLLECTION_NAME), p);
    }
    console.log('Semilla de datos completada.');
}


// --- Carrito (LocalStorage) ---

export function getCart() {
    return JSON.parse(localStorage.getItem(DB_CART_KEY)) || [];
}

export function saveCart(cart) {
    localStorage.setItem(DB_CART_KEY, JSON.stringify(cart));
}
