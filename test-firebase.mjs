import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAOzFUJ2wN4KU8aTAmizQS1oCUW0psmIFw",
  authDomain: "of-essence.firebaseapp.com",
  projectId: "of-essence",
  storageBucket: "of-essence.firebasestorage.app",
  messagingSenderId: "822977050450",
  appId: "1:822977050450:web:4e64116b50126b1712ac8b"
};

async function testFirebase() {
    console.log("Iniciando prueba de conexión a Firebase...");
    try {
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        console.log("Firebase inicializado correctamente.");

        const testCollection = collection(db, "test_connectivity");
        
        console.log("Intentando escribir un documento de prueba...");
        const docRef = await addDoc(testCollection, {
            message: "Hola Firebase desde Node.js",
            timestamp: new Date().toISOString()
        });
        console.log("¡Éxito! Documento escrito con ID: ", docRef.id);

        console.log("Intentando leer documentos de la colección de prueba...");
        const querySnapshot = await getDocs(testCollection);
        
        console.log(`¡Éxito! Se encontraron ${querySnapshot.size} documentos.`);
        if (querySnapshot.size > 0) {
            console.log("Primer documento:", JSON.stringify(querySnapshot.docs[0].data()));
        }

    } catch (e) {
        console.error("ERROR CRÍTICO en la conexión a Firebase:");
        console.error(e);
        if (e.code === 'permission-denied') {
            console.log("\nPOSIBLE SOLUCIÓN: Verifica las Reglas de Seguridad en la consola de Firebase. Deben permitir escritura/lectura.");
        }
    }
}

testFirebase();
