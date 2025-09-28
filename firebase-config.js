// firebase-config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase, ref, push, set, onValue, serverTimestamp, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCeffxvbYXiZdg04EkagAdvuiaI2vSVOys",
  authDomain: "app--hotel-villa-angelina.firebaseapp.com",
  databaseURL: "https://app--hotel-villa-angelina-default-rtdb.firebaseio.com",
  projectId: "app--hotel-villa-angelina",
  storageBucket: "app--hotel-villa-angelina.firebasestorage.app",
  messagingSenderId: "728436519655",
  appId: "1:728436519655:web:ba0c926e498fc371426842"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

// Global variables for Firebase connection
let currentUser = null;
let isConnected = false;

// Initialize Firebase Auth
export function initializeFirebase() {
  return new Promise((resolve) => {
    // Sign in anonymously
    signInAnonymously(auth)
      .then(() => {
        console.log('Signed in anonymously');
      })
      .catch((error) => {
        console.error('Error signing in anonymously:', error);
      });

    // Listen to auth state changes
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        isConnected = true;
        updateConnectionStatus('🔗 Conectado');
        console.log('User is signed in:', user.uid);
        resolve(user);
      } else {
        currentUser = null;
        isConnected = false;
        updateConnectionStatus('❌ Desconectado');
        console.log('User is signed out');
        resolve(null);
      }
    });
  });
}

// Update connection status in UI
function updateConnectionStatus(status) {
  const statusElement = document.getElementById('connectionStatus');
  if (statusElement) {
    statusElement.textContent = status;
    statusElement.className = isConnected ? 'connection-status' : 'connection-status offline';
  }
}

// Check if user is authenticated
export function isAuthenticated() {
  return currentUser !== null;
}

// Get current user
export function getCurrentUser() {
  return currentUser;
}

// Database references
export function getProductsRef() {
  return ref(database, 'products');
}

export function getSalesRef() {
  return ref(database, 'sales');
}

export function getStaysRef() {
  return ref(database, 'stays');
}

export function getExpensesRef() {
  return ref(database, 'expenses');
}

export function getSettingsRef() {
  return ref(database, 'settings/hotel');
}

// Add data functions
export function addSale(saleData) {
  if (!isAuthenticated()) {
    throw new Error('Usuario no autenticado');
  }
  
  const salesRef = getSalesRef();
  const newSaleRef = push(salesRef);
  
  const saleWithMetadata = {
    ...saleData,
    at: serverTimestamp(),
    createdBy: currentUser.uid
  };
  
  return set(newSaleRef, saleWithMetadata);
}

export function addStay(stayData) {
  if (!isAuthenticated()) {
    throw new Error('Usuario no autenticado');
  }
  
  const staysRef = getStaysRef();
  const newStayRef = push(staysRef);
  
  // Calculate nights
  const checkIn = new Date(stayData.checkIn);
  const checkOut = new Date(stayData.checkOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  
  const stayWithMetadata = {
    ...stayData,
    nights: nights,
    at: serverTimestamp(),
    createdBy: currentUser.uid
  };
  
  return set(newStayRef, stayWithMetadata);
}

export function addExpense(expenseData) {
  if (!isAuthenticated()) {
    throw new Error('Usuario no autenticado');
  }
  
  const expensesRef = getExpensesRef();
  const newExpenseRef = push(expensesRef);
  
  const expenseWithMetadata = {
    ...expenseData,
    at: serverTimestamp(),
    createdBy: currentUser.uid
  };
  
  return set(newExpenseRef, expenseWithMetadata);
}

export function addProduct(productData) {
  if (!isAuthenticated()) {
    throw new Error('Usuario no autenticado');
  }
  
  const productsRef = getProductsRef();
  const newProductRef = push(productsRef);
  
  const productWithMetadata = {
    ...productData,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  return set(newProductRef, productWithMetadata);
}

export function updateProduct(productId, productData) {
  if (!isAuthenticated()) {
    throw new Error('Usuario no autenticado');
  }
  
  const productRef = ref(database, `products/${productId}`);
  
  const updatedProduct = {
    ...productData,
    updatedAt: serverTimestamp()
  };
  
  return set(productRef, updatedProduct);
}

export function deleteProduct(productId) {
  if (!isAuthenticated()) {
    throw new Error('Usuario no autenticado');
  }
  
  const productRef = ref(database, `products/${productId}`);
  return remove(productRef);
}

// Listen to data changes
export function listenToProducts(callback) {
  const productsRef = getProductsRef();
  return onValue(productsRef, callback);
}

export function listenToSales(callback) {
  const salesRef = getSalesRef();
  return onValue(salesRef, callback);
}

export function listenToStays(callback) {
  const staysRef = getStaysRef();
  return onValue(staysRef, callback);
}

export function listenToExpenses(callback) {
  const expensesRef = getExpensesRef();
  return onValue(expensesRef, callback);
}

// Reset data functions
export function resetAllData() {
  if (!isAuthenticated()) {
    throw new Error('Usuario no autenticado');
  }
  
  const promises = [
    remove(getSalesRef()),
    remove(getStaysRef()),
    remove(getExpensesRef())
  ];
  
  return Promise.all(promises);
}

// Initialize products with initial data
export function initializeProducts() {
  const initialProducts = {
    "Agua brisa 600mL": 2000,
    "Agua cristal 300mL": 800,
    "Arranca muela": 200,
    "Chao": 100,
    "Choki": 2000,
    "Coca cola 1.5L": 7000,
    "Coca cola 400ml": 3000,
    "Cola roman 1.5L": 5000,
    "Colgate pequeño": 2500,
    "Desodorante balan": 1500,
    "Detodito": 3000,
    "Dorito": 2800,
    "Jugo del valle 1.5L": 5000,
    "Mamut": 500,
    "Manimoto cronch": 1800,
    "Maní moto salado": 1200,
    "Margaritas": 2800,
    "Pan aliñado (500)": 500,
    "Pan aliñado (1000)": 1000,
    "Pan de queso": 1000,
    "Savital acondicionador": 1500,
    "Savital shampo": 1500,
    "Sepillo de diente": 2000,
    "Súper coco": 200
  };
  
  const productsRef = getProductsRef();
  const promises = [];
  
  Object.entries(initialProducts).forEach(([name, price]) => {
    const newProductRef = push(productsRef);
    promises.push(set(newProductRef, {
      name: name,
      priceCOP: price,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));
  });
  
  return Promise.all(promises);
}

// Export Firebase instances
export { auth, database, serverTimestamp };