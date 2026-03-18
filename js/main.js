// OFF ESSENCE - Store Logic & Cart

const WHATSAPP_NUMBER = '1234567890'; // Replace with real number

document.addEventListener('DOMContentLoaded', () => {
    renderProducts();
    updateCartUI();

    // Setup Admin Login Form listener
    const loginForm = document.getElementById('loginForm');
    if(loginForm) {
        loginForm.addEventListener('submit', handleAdminLogin);
    }

    // Setup Cart Checkout Listener
    const btnCheckoutWhatsApp = document.getElementById('btnCheckoutWhatsApp');
    if(btnCheckoutWhatsApp) {
        btnCheckoutWhatsApp.addEventListener('click', handleCartCheckout);
    }
});

function renderProducts() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const products = getProducts();
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<div class="col-12 text-center text-muted"><p>No hay perfumes disponibles en el catálogo en este momento.</p></div>';
        return;
    }

    products.forEach(product => {
        const col = document.createElement('div');
        col.className = 'col-12 col-md-6 col-lg-4 d-flex align-items-stretch';
        
        col.innerHTML = `
            <div class="card card-luxury w-100 mb-4">
                <img src="${product.image}" class="card-img-top" alt="${product.name}" loading="lazy">
                <div class="card-body card-body-luxury d-flex flex-column">
                    <h5 class="product-title font-serif text-center">${product.name}</h5>
                    <p class="card-text text-muted small text-center flex-grow-1">${product.description}</p>
                    
                    <div class="mt-3">
                        <select class="form-select form-select-luxury mb-3 measure-select" id="measure-${product.id}">
                            <option value="30ml">Presentación 30ml</option>
                            <option value="50ml">Presentación 50ml</option>
                            <option value="100ml">Presentación 100ml</option>
                        </select>
                        
                        <div class="d-grid gap-2">
                            <button onclick="addToCart('${product.id}', '${product.name}')" class="btn btn-outline-dark rounded-0 custom-transition">
                                <i class="bi bi-cart-plus me-1"></i> Añadir al Carrito
                            </button>
                            <button onclick="consultAvailability('${product.name}', '${product.id}')" class="btn btn-gold rounded-0 custom-transition">
                                <i class="bi bi-whatsapp me-1"></i> Consultar Disponibilidad
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        grid.appendChild(col);
    });
}

// ---- WhatsApp Direct Button ----
function consultAvailability(productName, productId) {
    const selectEl = document.getElementById(`measure-${productId}`);
    const selectedMeasure = selectEl.value;

    const message = `Hola OFF ESSENCE, me interesa el perfume ${productName} en su presentación de ${selectedMeasure}. ¿Podrían ayudarme con el precio y disponibilidad?`;
    
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
}

// ---- Cart Logic ----
function addToCart(productId, productName) {
    const selectEl = document.getElementById(`measure-${productId}`);
    const selectedMeasure = selectEl.value;
    
    let cart = getCart();
    // Check if same item + measure exists
    const existingIndex = cart.findIndex(item => item.id === productId && item.measure === selectedMeasure);
    
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            measure: selectedMeasure,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartUI();
    
    // Optional: Show brief visual feedback (toast/alert) here if desired
}

function removeFromCart(index) {
    let cart = getCart();
    cart.splice(index, 1);
    saveCart(cart);
    updateCartUI();
}

function updateCartUI() {
    const cart = getCart();
    const countBadge = document.getElementById('cartCountBadge');
    const itemsContainer = document.getElementById('cartItemsContainer');
    const checkoutBtn = document.getElementById('btnCheckoutWhatsApp');

    if (!countBadge || !itemsContainer) return;

    // Update Badge total sum
    const totalItems = cart.reduce((acc, current) => acc + current.quantity, 0);
    countBadge.textContent = totalItems;

    // Update Modal
    itemsContainer.innerHTML = '';
    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p class="text-center text-muted my-4 font-sans small">Tu carrito está vacío.</p>';
        checkoutBtn?.classList.add('d-none');
    } else {
        checkoutBtn?.classList.remove('d-none');
        cart.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = 'd-flex justify-content-between align-items-center border-bottom border-light pb-2 mb-2';
            itemEl.innerHTML = `
                <div>
                    <h6 class="mb-0 font-serif text-primary-dark">${item.name}</h6>
                    <small class="text-muted font-sans">${item.measure} (x${item.quantity})</small>
                </div>
                <button class="btn btn-sm btn-outline-danger border-0" onclick="removeFromCart(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            `;
            itemsContainer.appendChild(itemEl);
        });
    }
}

// ---- Cart Checkout ----
function handleCartCheckout() {
    const cart = getCart();
    if (cart.length === 0) return;

    let message = "*Hola OFF ESSENCE, deseo consultar el presupuesto de los siguientes perfumes:\n\n";

    cart.forEach(item => {
        message += `${item.name} - ${item.measure} (x${item.quantity})\n`;
    });

    message += "\n¿Me podrían ayudar?*";

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    
    // Clear cart upon checkout? Optional. Usually yes.
    saveCart([]);
    updateCartUI();
    
    // Close modal
    const cartModalEl = document.getElementById('cartModal');
    if (cartModalEl) {
        const modal = bootstrap.Modal.getInstance(cartModalEl);
        if (modal) modal.hide();
    }

    window.open(whatsappUrl, '_blank');
}

// ---- Admin Login Logic ----
function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('adminUser').value;
    const pass = document.getElementById('adminPass').value;
    const errorMsg = document.getElementById('loginError');

    // Simple mock auth
    if (user === 'admin' && pass === '1234') {
        errorMsg.classList.add('d-none');
        sessionStorage.setItem('off_essence_admin', 'true');
        window.location.href = 'admin.html';
    } else {
        errorMsg.classList.remove('d-none');
    }
}
