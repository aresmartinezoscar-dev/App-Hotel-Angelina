// app.js
import { 
  initializeFirebase, 
  setAuthCallback,
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
    setupAuthListeners();
    await initializeFirebase();
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
    
    // Initialize products if empty
    if (Object.keys(appData.products).length === 0) {
      initializeProducts().then(() => {
        console.log('Initial products loaded');
      });
    }
  });
  
  // Listen to sales
  const unsubscribeSales = listenToSales((snapshot) => {
    const data = snapshot.val();
    appData.sales = data ? Object.keys(data).map(key => ({id: key, ...data[key]})) : [];
    updateBalance();
  });
  
  // Listen to stays
  const unsubscribeStays = listenToStays((snapshot) => {
    const data = snapshot.val();
    appData.stays = data ? Object.keys(data).map(key => ({id: key, ...data[key]})) : [];
    updateBalance();
  });
  
  // Listen to expenses
  const unsubscribeExpenses = listenToExpenses((snapshot) => {
    const data = snapshot.val();
    appData.expenses = data ? Object.keys(data).map(key => ({id: key, ...data[key]})) : [];
    updateBalance();
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
  const saleDateTime = document.getElementById('saleDateTime');
  const expenseDateTime = document.getElementById('expenseDateTime');
  
  if (checkIn) checkIn.value = today;
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
  const selectedProduct = Object.keys(appData.products).find(key => key === selectedProductId);
  
  if (!selectedProduct) {
    showError('Debes seleccionar un producto válido');
    return;
  }
  
  const saleData = {
    productId: selectedProductId,
    productName: appData.products[selectedProductId].name,
    unitPriceCOP: parseInt(document.getElementById('salePrice').value),
    quantity: parseInt(document.getElementById('quantity').value),
    totalCOP: parseInt(document.getElementById('totalPrice').value)
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
    notes: document.getElementById('expenseNotes').value.trim() || undefined
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
    document.getElementById('salePrice').value = product.priceCOP;
    calculateTotal();
  } else {
    document.getElementById('salePrice').value = '';
    document.getElementById('totalPrice').value = '';
  }
}

// Calculate total price
function calculateTotal() {
  const quantity = parseInt(document.getElementById('quantity').value) || 0;
  const price = parseInt(document.getElementById('salePrice').value) || 0;
  const total = quantity * price;
  document.getElementById('totalPrice').value = total;
}

// Load products in select
function loadProductsInSelect() {
  const productSelect = document.getElementById('product');
  if (!productSelect) return;
  
  productSelect.innerHTML = '<option value="">Selecciona un producto...</option>';
  
  // Sort products alphabetically
  const sortedProducts = Object.entries(appData.products)
    .sort(([,a], [,b]) => a.name.localeCompare(b.name));
  
  sortedProducts.forEach(([productId, product]) => {
    if (product.active !== false) {
      const option = document.createElement('option');
      option.value = productId;
      option.textContent = `${product.name} - ${formatCurrency(product.priceCOP)}`;
      productSelect.appendChild(option);
    }
  });
}

// Update balance display
function updateBalance() {
  const totalSales = appData.sales.reduce((sum, sale) => sum + (sale.totalCOP || 0), 0);
  const totalStays = appData.stays.reduce((sum, stay) => sum + (stay.priceCOP || 0), 0);
  const totalExpenses = appData.expenses.reduce((sum, expense) => sum + (expense.amountCOP || 0), 0);
  
  const totalIncome = totalSales + totalStays;
  const netBalance = totalIncome - totalExpenses;
  
  document.getElementById('totalIncome').textContent = formatCurrency(totalIncome);
  document.getElementById('totalExpenses').textContent = formatCurrency(totalExpenses);
  
  const netBalanceElement = document.getElementById('netBalance');
  netBalanceElement.textContent = formatCurrency(netBalance);
  netBalanceElement.className = netBalance >= 0 ? 'positive' : 'negative';
}

// Toggle more info
function toggleMoreInfo() {
  const content = document.getElementById('moreInfoContent');
  const button = document.querySelector('.more-info-btn');
  
  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'block';
    button.textContent = 'Ocultar Información';
    showDetailedInfo();
  } else {
    content.style.display = 'none';
    button.textContent = 'Más Información';
  }
}

// Show detailed information
function showDetailedInfo() {
  let detailContent = '';
  
  // Sales details
  detailContent += '<h3 style="color: #374151; margin: 20px 0 15px 0;">🛒 Ventas Detalladas</h3>';
  if (appData.sales.length > 0) {
    detailContent += '<div class="detail-list">';
    appData.sales.slice(-10).reverse().forEach(sale => {
      const date = sale.at ? new Date(sale.at).toLocaleDateString('es-CO') : 'Sin fecha';
      detailContent += `
        <div class="detail-item">
          <strong>${sale.productName}</strong><br>
          <small>Fecha: ${date} | Cantidad: ${sale.quantity} | Precio unitario: ${formatCurrency(sale.unitPriceCOP)}</small><br>
          <span class="positive">Total: ${formatCurrency(sale.totalCOP)}</span>
        </div>
      `;
    });
    detailContent += '</div>';
  } else {
    detailContent += '<p style="color: #6b7280; font-style: italic;">No hay ventas registradas</p>';
  }
  
  // Stays details
  detailContent += '<h3 style="color: #374151; margin: 20px 0 15px 0;">👥 Estancias Detalladas</h3>';
  if (appData.stays.length > 0) {
    detailContent += '<div class="detail-list">';
    appData.stays.slice(-10).reverse().forEach(stay => {
      const checkIn = new Date(stay.checkIn).toLocaleDateString('es-CO');
      const checkOut = new Date(stay.checkOut).toLocaleDateString('es-CO');
      detailContent += `
        <div class="detail-item">
          <strong>${stay.guestName}</strong> - ${stay.rooms} habitación(es)<br>
          <small>Check-in: ${checkIn} | Check-out: ${checkOut} | Noches: ${stay.nights || 0}</small><br>
          <span class="positive">${formatCurrency(stay.priceCOP)}</span>
        </div>
      `;
    });
    detailContent += '</div>';
  } else {
    detailContent += '<p style="color: #6b7280; font-style: italic;">No hay huéspedes registrados</p>';
  }
  
  // Expenses details
  detailContent += '<h3 style="color: #374151; margin: 20px 0 15px 0;">💸 Gastos Detallados</h3>';
  if (appData.expenses.length > 0) {
    detailContent += '<div class="detail-list">';
    appData.expenses.slice(-10).reverse().forEach(expense => {
      const date = expense.at ? new Date(expense.at).toLocaleDateString('es-CO') : 'Sin fecha';
      detailContent += `
        <div class="detail-item">
          <strong>${expense.concept}</strong><br>
          <small>Fecha: ${date}</small><br>
          ${expense.notes ? `<small>${expense.notes}</small><br>` : ''}
          <span class="negative">${formatCurrency(expense.amountCOP)}</span>
        </div>
      `;
    });
    detailContent += '</div>';
  } else {
    detailContent += '<p style="color: #6b7280; font-style: italic;">No hay gastos registrados</p>';
  }
  
  document.getElementById('moreInfoContent').innerHTML = detailContent;
}

// Product management functions
function updateProductsList() {
  const productsList = document.getElementById('productsList');
  if (!productsList) return;
  
  productsList.innerHTML = '';
  
  const sortedProducts = Object.entries(appData.products)
    .sort(([,a], [,b]) => a.name.localeCompare(b.name));
  
  sortedProducts.forEach(([productId, product]) => {
    if (product.active !== false) {
      const productDiv = document.createElement('div');
      productDiv.className = 'product-item';
      productDiv.innerHTML = `
        <div>
          <strong>${product.name}</strong><br>
          <small>${formatCurrency(product.priceCOP)}</small>
        </div>
        <div class="product-actions">
          <button class="edit-btn" onclick="editProduct('${productId}')">✏️ Editar</button>
          <button class="delete-btn" onclick="deleteProductConfirm('${productId}')">🗑️ Eliminar</button>
        </div>
      `;
      productsList.appendChild(productDiv);
    }
  });
}

async function addNewProduct() {
  const name = document.getElementById('newProductName').value.trim();
  const price = parseInt(document.getElementById('newProductPrice').value);
  
  if (!name || !price || price < 0) {
    showError('Por favor, completa todos los campos correctamente');
    return;
  }
  
  // Check if product name already exists
  const existingProduct = Object.values(appData.products).find(p => 
    p.name.toLowerCase() === name.toLowerCase() && p.active !== false
  );
  
  if (existingProduct) {
    showError('Ya existe un producto con ese nombre');
    return;
  }
  
  const productData = {
    name: name,
    priceCOP: price
  };
  
  try {
    await addProduct(productData);
    showSuccess('✅ Producto añadido correctamente');
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductPrice').value = '';
  } catch (error) {
    console.error('Error adding product:', error);
    showError('Error al añadir producto');
  }
}

function editProduct(productId) {
  const product = appData.products[productId];
  if (!product) return;
  
  appData.currentEditingProduct = productId;
  document.getElementById('editProductName').value = product.name;
  document.getElementById('editProductPrice').value = product.priceCOP;
  closeModal('productAdminModal');
  document.getElementById('editProductModal').style.display = 'block';
}

async function saveProductEdit() {
  const productId = appData.currentEditingProduct;
  const newName = document.getElementById('editProductName').value.trim();
  const newPrice = parseInt(document.getElementById('editProductPrice').value);
  
  if (!newName || !newPrice || newPrice < 0) {
    showError('Por favor, completa todos los campos correctamente');
    return;
  }
  
  // Check if name conflicts with other products
  const existingProduct = Object.entries(appData.products).find(([id, p]) => 
    id !== productId && p.name.toLowerCase() === newName.toLowerCase() && p.active !== false
  );
  
  if (existingProduct) {
    showError('Ya existe un producto con ese nombre');
    return;
  }
  
  const updatedProduct = {
    ...appData.products[productId],
    name: newName,
    priceCOP: newPrice
  };
  
  try {
    await updateProduct(productId, updatedProduct);
    showSuccess('✅ Producto actualizado correctamente');
    closeModal('editProductModal');
    showProductAdmin();
  } catch (error) {
    console.error('Error updating product:', error);
    showError('Error al actualizar producto');
  }
}

function deleteProductConfirm(productId) {
  const product = appData.products[productId];
  if (!product) return;
  
  if (confirm(`¿Estás seguro de eliminar "${product.name}"?`)) {
    deleteProductById(productId);
  }
}

async function deleteProductById(productId) {
  try {
    await deleteProduct(productId);
    showSuccess('✅ Producto eliminado correctamente');
  } catch (error) {
    console.error('Error deleting product:', error);
    showError('Error al eliminar producto');
  }
}

// Reset functions
function confirmReset() {
  if (confirm('⚠️ ¿Estás seguro de resetear todos los datos?\n\nEsta acción eliminará:\n- Todos los huéspedes\n- Todas las ventas\n- Todos los gastos\n\n⚠️ ESTA ACCIÓN NO SE PUEDE DESHACER')) {
    performReset();
  }
}

async function performReset() {
  try {
    await resetAllData();
    showSuccess('✅ Datos reseteados correctamente');
    updateBalance();
  } catch (error) {
    console.error('Error resetting data:', error);
    showError('Error al resetear datos');
  }
}

function saveResetSettings() {
  const resetDay = parseInt(document.getElementById('resetDay').value);
  
  if (resetDay && (resetDay < 1 || resetDay > 28)) {
    showError('El día debe estar entre 1 y 28');
    return;
  }
  
  // Here you could save the reset settings to Firebase
  // For now, just show success message
  showSuccess('✅ Configuración guardada');
  closeModal('resetOptionsModal');
}

// Make functions globally accessible
window.showIncomeOptions = showIncomeOptions;
window.showGuestForm = showGuestForm;
window.showSaleForm = showSaleForm;
window.showExpenseModal = showExpenseModal;
window.showProductAdmin = showProductAdmin;
window.showResetOptions = showResetOptions;
window.closeModal = closeModal;
window.toggleMoreInfo = toggleMoreInfo;
window.addNewProduct = addNewProduct;
window.editProduct = editProduct;
window.saveProductEdit = saveProductEdit;
window.deleteProductConfirm = deleteProductConfirm;
window.confirmReset = confirmReset;
window.saveResetSettings = saveResetSettings;
window.showLogin = showLogin;
window.showRegister = showRegister;
window.logout = logout;

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);