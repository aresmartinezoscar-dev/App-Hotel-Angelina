import { initializeFirebase, isAuthenticated, loginUser, registerUser, logoutUser, showLoginScreen, showRegisterScreen, addSale, addStay, addExpense, addProduct, updateProduct, deleteProduct, listenToProducts, listenToSales, listenToStays, listenToExpenses, resetAllData, initializeProducts } from './firebase-config.js';

let appData = { products: {}, sales: [], stays: [], expenses: [], listeners: [] };

async function init() {
  try {
    await initializeFirebase(() => {
      startDataListeners();
      updateBalance();
    });
  } catch (error) { console.error('Init error:', error); }
}

function startDataListeners() {
  const unsubP = listenToProducts((s) => { appData.products = s.val() || {}; updateBalance(); });
  const unsubS = listenToSales((s) => { appData.sales = s.val() || []; updateBalance(); });
  const unsubSt = listenToStays((s) => { appData.stays = s.val() || []; updateBalance(); });
  const unsubE = listenToExpenses((s) => { appData.expenses = s.val() || []; updateBalance(); });
  appData.listeners = [unsubP, unsubS, unsubSt, unsubE];
  updateBalance();
}

function updateBalance() {
  console.log('Balance actualizado', appData);
}

export { startDataListeners };
init();