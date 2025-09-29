import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, updateProfile } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getDatabase, ref, push, set, onValue, remove } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const firebaseConfig = {
  apiKey: "AIzaSyCeffxvbYXiZdg04EkagAdvuiaI2vSVOys",
  authDomain: "app--hotel-villa-angelina.firebaseapp.com",
  databaseURL: "https://app--hotel-villa-angelina-default-rtdb.firebaseio.com",
  projectId: "app--hotel-villa-angelina",
  storageBucket: "app--hotel-villa-angelina.firebasestorage.app",
  messagingSenderId: "728436519655",
  appId: "1:728436519655:web:ba0c926e498fc371426842"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

let currentUser = null;
let isConnected = false;

export function showLoginScreen() {
  document.getElementById('loginScreen').style.display = 'block';
  document.getElementById('registerScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'none';
}

export function showRegisterScreen() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('registerScreen').style.display = 'block';
  document.getElementById('mainApp').style.display = 'none';
}

function showMainApp() {
  document.getElementById('loginScreen').style.display = 'none';
  document.getElementById('registerScreen').style.display = 'none';
  document.getElementById('mainApp').style.display = 'block';
}

function updateConnectionStatus(status) {
  const statusElement = document.getElementById('connectionStatus');
  if (!statusElement) return;
  if (!currentUser) {
    statusElement.style.display = 'none';
  } else {
    statusElement.style.display = 'block';
    statusElement.textContent = status;
    statusElement.className = isConnected ? 'connection-status' : 'connection-status offline';
  }
}

export function initializeFirebase(onUserAuthenticated) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        isConnected = true;
        updateConnectionStatus('🔗 Conectado');
        showMainApp();
        if (typeof onUserAuthenticated === 'function') onUserAuthenticated();
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

export async function loginUser(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}
export async function registerUser(email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}
export async function logoutUser() { await signOut(auth); }
export function isAuthenticated() { return currentUser !== null; }
export function getCurrentUser() { return currentUser; }
export function getProductsRef() { return ref(database, 'products'); }
export function getSalesRef() { return ref(database, 'sales'); }
export function getStaysRef() { return ref(database, 'stays'); }
export function getExpensesRef() { return ref(database, 'expenses'); }