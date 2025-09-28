// firebase-config.js
// Firebase modular SDK (v10.x) - Email/Password auth
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getDatabase, ref, push, set, onValue, serverTimestamp, remove 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// ---- Your Firebase project (provided by you) ----
const firebaseConfig = {
  apiKey: "AIzaSyCeffxvbYXiZdg04EkagAdvuiaI2vSVOys",
  authDomain: "app--hotel-villa-angelina.firebaseapp.com",
  databaseURL: "https://app--hotel-villa-angelina-default-rtdb.firebaseio.com",
  projectId: "app--hotel-villa-angelina",
  storageBucket: "app--hotel-villa-angelina.firebasestorage.app",
  messagingSenderId: "728436519655",
  appId: "1:728436519655:web:ba0c926e498fc371426842"
};

// ---- Init ----
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;
let isConnected = false;

// ---- UI helpers (exported because app.js calls them) ----
export function showLoginScreen() {
  const login = document.getElementById('loginScreen');
  const register = document.getElementById('registerScreen');
  const main = document.getElementById('mainApp');
  if (login) login.style.display = 'block';
  if (register) register.style.display = 'none';
  if (main) main.style.display = 'none';
}

export function showRegisterScreen() {
  const login = document.getElementById('loginScreen');
  const register = document.getElementById('registerScreen');
  const main = document.getElementById('mainApp');
  if (login) login.style.display = 'none';
  if (register) register.style.display = 'block';
  if (main) main.style.display = 'none';
}

function showMainApp() {
  const login = document.getElementById('loginScreen');
  const register = document.getElementById('registerScreen');
  const main = document.getElementById('mainApp');
  if (login) login.style.display = 'none';
  if (register) register.style.display = 'none';
  if (main) main.style.display = 'block';
}

// ---- Connection badge ----
function updateConnectionStatus(status) {
  const statusElement = document.getElementById('connectionStatus');
  if (statusElement) {
    statusElement.textContent = status;
    statusElement.className = isConnected ? 'connection-status' : 'connection-status offline';
  }
}

// ---- Auth bootstrap ----
export function initializeFirebase() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        isConnected = true;
        updateConnectionStatus('🔗 Conectado');
        showMainApp();
        resolve(user);
      } else {
        currentUser = null;
        isConnected = false;
        updateConnectionStatus('❌ Desconectado');
        showLoginScreen();
        resolve(null);
      }
    });
  });
}

// ---- Auth actions (email/password) ----
export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function registerUser(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  // Optional: set displayName from register form if present
  const nameInput = document.getElementById('registerName');
  if (nameInput && nameInput.value.trim()) {
    try { await updateProfile(cred.user, { displayName: nameInput.value.trim() }); } catch {}
  }
  return cred.user;
}

export async function logoutUser() {
  await signOut(auth);
}

// ---- Helpers ----
export function isAuthenticated() { return currentUser !== null; }
export function getCurrentUser() { return currentUser; }

// ---- DB refs ----
export function getProductsRef() { return ref(database, 'products'); }
export function getSalesRef() { return ref(database, 'sales'); }
export function getStaysRef() { return ref(database, 'stays'); }
export function getExpensesRef() { return ref(database, 'expenses'); }
export function getSettingsRef() { return ref(database, 'settings/hotel'); }

// ---- Create ops (respect rules; allow custom date "at" if provided) ----
export function addSale(saleData) {
  if (!isAuthenticated()) throw new Error('Usuario no autenticado');
  const newRef = push(getSalesRef());
  const payload = {
    ...saleData,
    at: (typeof saleData.at === 'number') ? saleData.at : serverTimestamp(),
    createdBy: currentUser.uid
  };
  return set(newRef, payload);
}

export function addStay(stayData) {
  if (!isAuthenticated()) throw new Error('Usuario no autenticado');
  const newRef = push(getStaysRef());
  const checkIn = new Date(stayData.checkIn);
  const checkOut = new Date(stayData.checkOut);
  const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
  const payload = {
    ...stayData,
    nights,
    at: (typeof stayData.at === 'number') ? stayData.at : serverTimestamp(),
    createdBy: currentUser.uid
  };
  return set(newRef, payload);
}

export function addExpense(expenseData) {
  if (!isAuthenticated()) throw new Error('Usuario no autenticado');
  const newRef = push(getExpensesRef());
  const payload = {
    ...expenseData,
    at: (typeof expenseData.at === 'number') ? expenseData.at : serverTimestamp(),
    createdBy: currentUser.uid
  };
  return set(newRef, payload);
}

export function addProduct(productData) {
  if (!isAuthenticated()) throw new Error('Usuario no autenticado');
  const newRef = push(getProductsRef());
  const payload = {
    ...productData,
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  return set(newRef, payload);
}

export function updateProduct(productId, productData) {
  if (!isAuthenticated()) throw new Error('Usuario no autenticado');
  const productRef = ref(database, `products/${productId}`);
  const payload = {
    ...productData,
    updatedAt: serverTimestamp()
  };
  return set(productRef, payload);
}

export function deleteProduct(productId) {
  if (!isAuthenticated()) throw new Error('Usuario no autenticado');
  const productRef = ref(database, `products/${productId}`);
  return remove(productRef);
}

// ---- Live listeners ----
export function listenToProducts(callback) { return onValue(getProductsRef(), callback); }
export function listenToSales(callback)    { return onValue(getSalesRef(), callback); }
export function listenToStays(callback)    { return onValue(getStaysRef(), callback); }
export function listenToExpenses(callback) { return onValue(getExpensesRef(), callback); }

// ---- Reset (keeps products) ----
export function resetAllData() {
  if (!isAuthenticated()) throw new Error('Usuario no autenticado');
  const ops = [ remove(getSalesRef()), remove(getStaysRef()), remove(getExpensesRef()) ];
  return Promise.all(ops);
}

// ---- Seed initial products (24 items) ----
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
  const tasks = [];
  Object.entries(initialProducts).forEach(([name, price]) => {
    const newRef = push(productsRef);
    tasks.push(set(newRef, {
      name,
      priceCOP: price,
      active: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }));
  });
  return Promise.all(tasks);
}

// Export Firebase instances if needed elsewhere
export { auth, database, serverTimestamp };
