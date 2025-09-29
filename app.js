// app.js
import { 
  initializeFirebase, 
  isAuthenticated, 
  getCurrentUser,
  loginUser,
  registerUser,
  logoutUser,
  showLoginScreen,
  showRegisterScreen,
  addSale,
  addStay, 
  addExpense,
  addProduct,
  updateProduct,
  deleteProduct,
  listenToProducts,
  listenToSales,
  listenToStays,
  listenToExpenses,
  resetAllData,
  initializeProducts
} from './firebase-config.js';

// Global data storage
let appData = {
  products: {},
  sales: [],
  stays: [],
  expenses: [],
  currentEditingProduct: null,
  listeners: []
};

// Initialize application
async function init() {
  try {
    console.log('Initializing app...');
    // No es necesario llamar a initializeFirebase aquí,
    // ya que onAuthStateChanged en firebase-config se encargará de ello
    // y llamará a setupAuthListeners y startDataListeners si el usuario ya está autenticado.
    setupAuthListeners();
    // La inicialización de Firebase ya maneja la lógica de onAuthStateChanged
    // y la redirección a la app principal si el usuario está logueado.
    await initializeFirebase(); // Esto iniciará el listener de auth y resolverá la promesa.
    setupEventListeners();
  } catch (error) {
    console.error('Error initializing app:', error);
    showError('Error al inicializar la aplicación');
  }
}

// Setup authentication event listeners
function setupAuthListeners() {
  // Login form
  document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    
    if (!email || !password) {
      showError('Por favor completa todos los campos');
      return;
    }
    
    try {
      loginBtn.textContent = 'Conectando...';
      loginBtn.disabled = true;
      
      await loginUser(email, password);
      
      // Save credentials for next time (optional)
      localStorage.setItem('hotelLastEmail', email);
      
      showSuccess('✅ Sesión iniciada correctamente');
      
      // Start data listeners after successful login
      startDataListeners();
      setCurrentDateTime();
      updateBalance();
      
      // **Asegurarse de inicializar los productos después del login**
      await initializeProducts(); // Agregado: Inicializa productos después del login
      
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Error al iniciar sesión';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Usuario no encontrado';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Contraseña incorrecta';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Demasiados intentos. Intenta más tarde';
      }
      
      showError(errorMessage);
    } finally {
      loginBtn.textContent = 'Iniciar Sesión';
      loginBtn.disabled = false;
    }
  });
  
  // Register form
  document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const registerBtn = document.getElementById('registerBtn');
    
    if (!email || !password) {
      showError('Por favor completa todos los campos requeridos');
      return;
    }
    
    if (password.length < 6) {
      showError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    try {
      registerBtn.textContent = 'Creando cuenta...';
      registerBtn.disabled = true;
      
      await registerUser(email, password);
      
      // Save credentials for next time
      localStorage.setItem('hotelLastEmail', email);
      
      showSuccess('✅ Cuenta creada correctamente');
      
      // Start data listeners after successful registration
      startDataListeners();
      setCurrentDateTime();
      updateBalance();

      // **Asegurarse de inicializar los productos después del registro**
      await initializeProducts(); // Agregado: Inicializa productos después del registro
      
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Error al crear cuenta';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Este email ya está en uso';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Email inválido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      }
      
      showError(errorMessage);
    } finally {
      registerBtn.textContent = 'Crear Cuenta';
      registerBtn.disabled = false;
    }
  });
  
  // Load last email if exists
  const lastEmail = localStorage.getItem('hotelLastEmail');
  if (lastEmail) {
    document.getElementById('loginEmail').value = lastEmail;
    document.getElementById('registerEmail').value = lastEmail;
  }
}

// Show/hide auth screens
function showLogin() {
  showLoginScreen();
}

function showRegister() {
  showRegisterScreen();
}

// Logout function
async function logout() {
  if (confirm('¿Estás seguro de cerrar sesión?')) {
    try {
      // Clean up listeners
      appData.listeners.forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      appData.listeners = [];
      
      await logoutUser();
      showSuccess('👋 Sesión cerrada');
    } catch (error) {
      console.error('Logout error:', error);
      showError('Error al cerrar sesión');
    }
  }
}

// Setup event listeners
function setupEventListeners() {
  // Guest form
  document.getElementById('guestForm').addEventListener('submit', handleGuestSubmit);
  
  // Sale form
  document.getElementById('saleForm').addEventListener('submit', handleSaleSubmit);
  
  // Expense form
  document.getElementById('expenseForm').addEventListener('submit', handleExpenseSubmit);
  
  // Product selection change
  document.getElementById('product').addEventListener('change', handleProductChange);
  
  // Quantity change
  document.getElementById('quantity').addEventListener('input', calculateTotal);
  
  // Close modals on outside click
  window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
}

// Start Firebase data listeners
function startDataListeners() {
  // Listen to products
  const unsubscribeProducts = listenToProducts((snapshot) => {
    const data = snapshot.val();
    appData.products = data || {};
    loadProductsInSelect();
    updateProductsList();
    
    // **No inicializamos productos aquí, lo haremos después de login/registro**
    // Si la lista está vacía después del primer fetch, la inicialización ya se encargó.
    // console.log('Products data updated:', appData.products); 
    // console.log('Number of products:', Object.keys(appData.products).length);

    // // Comentado: Esta lógica se movió a los handlers de login/register para asegurar auth.
    // if (Object.keys(appData.products).length === 0) {
    //   initializeProducts().then(() => {
    //     console.log('Initial products loaded');
    //   }).catch(error => console.error('Error initializing products:', error));
    // }
  });
  
  // Listen to sales
  const unsubscribeSales = listenToSales((snapshot) => {
    const data = snapshot.val();
    appData.sales = data ? Object.keys(data).map(key => ({id: key, ...data[key]})) : [];
    updateBalance();
    // También actualizar info detallada si está visible
    if (document.getElementById('moreInfoContent').style.display === 'block') {
      showDetailedInfo();
    }
  });
  
  // Listen to stays
  const unsubscribeStays = listenToStays((snapshot) => {
    const data = snapshot.val();
    appData.stays = data ? Object.keys(data).map(key => ({id: key, ...data[key]})) : [];
    updateBalance();
    // También actualizar info detallada si está visible
    if (document.getElementById('moreInfoContent').style.display === 'block') {
      showDetailedInfo();
    }
  });
  
  // Listen to expenses
  const unsubscribeExpenses = listenToExpenses((snapshot) => {
    const data = snapshot.val();
    appData.expenses = data ? Object.keys(data).map(key => ({id: key, ...data[key]})) : [];
    updateBalance();
    // También actualizar info detallada si está visible
    if (document.getElementById('moreInfoContent').style.display === 'block') {
      showDetailedInfo();
    }
  });
  
  // Store unsubscribe functions
  appData.listeners = [unsubscribeProducts, unsubscribeSales, unsubscribeStays, unsubscribeExpenses];
}

// Set current date and time
function setCurrentDateTime() {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentDateTime = now.toISOString().slice(0, 16);
  
  // Set dates
  const checkIn = document.getElementById('checkIn');
  const checkOut = document.getElementById('checkOut'); // Agregado: para setting del checkOut
  const saleDateTime = document.getElementById('saleDateTime');
  const expenseDateTime = document.getElementById('expenseDateTime');
  
  if (checkIn) checkIn.value = today;
  if (checkOut) checkOut.value = today; // Sugerencia: Set checkOut initially to today too
  if (saleDateTime) saleDateTime.value = currentDateTime;
  if (expenseDateTime) expenseDateTime.value = currentDateTime;
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount || 0);
}

// Show success message
function showSuccess(message = '✅ Operación completada') {
  const popup = document.getElementById('successPopup');
  const messageEl = document.getElementById('successMessage');
  popup.className = 'success-popup';
  messageEl.textContent = message;
  popup.style.display = 'block';
  
  setTimeout(() => {
    popup.style.display = 'none';
  }, 1500);
}

// Show error message
function showError(message) {
  const popup = document.getElementById('successPopup');
  const messageEl = document.getElementById('successMessage');
  popup.className = 'success-popup error-popup';
  messageEl.textContent = `❌ ${message}`;
  popup.style.display = 'block';
  
  setTimeout(() => {
    popup.style.display = 'none';
  }, 3000);
}

// Modal functions
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}

function showIncomeOptions() {
  document.getElementById('incomeModal').style.display = 'block';
}

function showGuestForm() {
  closeModal('incomeModal');
  document.getElementById('guestModal').style.display = 'block';
  setCurrentDateTime();
}

function showSaleForm() {
  closeModal('incomeModal');
  document.getElementById('saleModal').style.display = 'block';
  setCurrentDateTime();
  loadProductsInSelect();
}

function showExpenseModal() {
  document.getElementById('expenseModal').style.display = 'block';
  setCurrentDateTime();
}

function showProductAdmin() {
  document.getElementById('productAdminModal').style.display = 'block';
  updateProductsList();
}

function showResetOptions() {
  document.getElementById('resetOptionsModal').style.display = 'block';
}

// Handle form submissions
async function handleGuestSubmit(e) {
  e.preventDefault();
  
  if (!isAuthenticated()) {
    showError('Debes estar autenticado para registrar huéspedes');
    return;
  }
  
  const checkInDate = new Date(document.getElementById('checkIn').value);
  const checkOutDate = new Date(document.getElementById('checkOut').value);
  
  if (checkOutDate <= checkInDate) {
    showError('La fecha de salida debe ser posterior a la de entrada');
    return;
  }
  
  const stayData = {
    guestName: document.getElementById('guestName').value.trim(),
    rooms: parseInt(document.getElementById('roomsNumber').value),
    checkIn: checkInDate.getTime(),
    checkOut: checkOutDate.getTime(),
    priceCOP: parseInt(document.getElementById('guestPrice').value)
  };
  
  try {
    document.querySelector('#guestForm .submit-btn').classList.add('loading');
    await addStay(stayData);
    showSuccess('✅ Huésped registrado correctamente');
    closeModal('guestModal');
    e.target.reset();
    setCurrentDateTime();
  } catch (error) {
    console.error('Error adding stay:', error);
    showError('Error al registrar huésped');
  } finally {
    document.querySelector('#guestForm .submit-btn').classList.remove('loading');
  }
}

async function handleSaleSubmit(e) {
  e.preventDefault();
  
  if (!isAuthenticated()) {
    showError('Debes estar autenticado para registrar ventas');
    return;
  }
  
  const productSelect = document.getElementById('product');
  const selectedProductId = productSelect.value;
  // const selectedProduct = Object.keys(appData.products).find(key => key === selectedProductId);
  // Simplificado, ya que appData.products[selectedProductId] ya te da el producto.
  const selectedProduct = appData.products[selectedProductId];
  
  if (!selectedProduct) {
    showError('Debes seleccionar un producto válido');
    return;
  }
  
  const saleData = {
    productId: selectedProductId,
    productName: selectedProduct.name, // Usar el nombre del producto directamente
    unitPriceCOP: parseInt(document.getElementById('salePrice').value),
    quantity: parseInt(document.getElementById('quantity').value),
    totalCOP: parseInt(document.getElementById('totalPrice').value),
    at: new Date(document.getElementById('saleDateTime').value).getTime()
  };
  
  try {
    document.querySelector('#saleForm .submit-btn').classList.add('loading');
    await addSale(saleData);
    showSuccess('✅ Venta registrada correctamente');
    closeModal('saleModal');
    e.target.reset();
    document.getElementById('quantity').value = '1';
    setCurrentDateTime();
  } catch (error) {
    console.error('Error adding sale:', error);
    showError('Error al registrar venta');
  } finally {
    document.querySelector('#saleForm .submit-btn').classList.remove('loading');
  }
}

async function handleExpenseSubmit(e) {
  e.preventDefault();
  
  if (!isAuthenticated()) {
    showError('Debes estar autenticado para registrar gastos');
    return;
  }
  
  const expenseData = {
    concept: document.getElementById('expenseConcept').value.trim(),
    amountCOP: parseInt(document.getElementById('expenseAmount').value),
    notes: document.getElementById('expenseNotes').value.trim() || undefined,
    at: new Date(document.getElementById('expenseDateTime').value).getTime()
  };
  
  try {
    document.querySelector('#expenseForm .submit-btn').classList.add('loading');
    await addExpense(expenseData);
    showSuccess('✅ Gasto registrado correctamente');
    closeModal('expenseModal');
    e.target.reset();
    setCurrentDateTime();
  } catch (error) {
    console.error('Error adding expense:', error);
    showError('Error al registrar gasto');
  } finally {
    document.querySelector('#expenseForm .submit-btn').classList.remove('loading');
  }
}

// Handle product selection
function handleProductChange() {
  const productSelect = document.getElementById('product');
  const selectedProductId = productSelect.value;
  
  if (selectedProductId && appData.products[selectedProductId]) {
    const product = appData.products[selectedProductId];
    document

// al final de app.js
export { startDataListeners };
