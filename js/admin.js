// OFF ESSENCE - Admin Panel Logic

let currentUploadedImageBase64 = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderAdminTable();

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProduct();
        });
    }

    const uploadInput = document.getElementById('perfumeImageUpload');
    if (uploadInput) {
        uploadInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    currentUploadedImageBase64 = event.target.result;
                    const previewContainer = document.getElementById('imagePreviewContainer');
                    const previewImage = document.getElementById('imagePreview');
                    previewImage.src = currentUploadedImageBase64;
                    previewContainer.classList.remove('d-none');
                    // Limpiar el campo de URL si se sube una imagen
                    document.getElementById('perfumeImage').value = '';
                    document.getElementById('perfumeImage').removeAttribute('required');
                };
                reader.readAsDataURL(file);
            } else {
                currentUploadedImageBase64 = null;
            }
        });
    }

    // Asegurarse de quitar required si hay imagen o url al tipear
    const urlInput = document.getElementById('perfumeImage');
    if (urlInput) {
        urlInput.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                currentUploadedImageBase64 = null;
                const uploadField = document.getElementById('perfumeImageUpload');
                if(uploadField) uploadField.value = '';
                document.getElementById('imagePreviewContainer').classList.add('d-none');
            }
        });
    }
});

function checkAuth() {
    const isAuth = sessionStorage.getItem('off_essence_admin');
    if (isAuth !== 'true') {
        window.location.href = 'index.html';
    }
}

function logoutAdmin() {
    sessionStorage.removeItem('off_essence_admin');
    window.location.href = 'index.html';
}

function renderAdminTable() {
    const tableBody = document.getElementById('adminProductTable');
    if (!tableBody) return;

    tableBody.innerHTML = '';
    const products = getProducts();

    if (products.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-muted py-4">No hay perfumes registrados en el inventario.</td>
            </tr>
        `;
        return;
    }

    products.forEach(product => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="ps-4">
                <img src="${product.image}" alt="${product.name}" class="admin-table-img border border-light shadow-sm">
            </td>
            <td class="font-serif fw-bold text-primary-dark">${product.name}</td>
            <td class="text-muted small w-25 text-truncate" style="max-width: 250px;">${product.description}</td>
            <td class="font-sans fw-semibold ${product.stock < 10 ? 'text-danger' : 'text-success'}">${product.stock}</td>
            <td class="text-end pe-4">
                <button class="btn btn-sm btn-outline-dark me-1" onclick="openProductModal('${product.id}')">
                    <i class="bi bi-pencil"></i> Editar
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product.id}')">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        `;
        tableBody.appendChild(tr);
    });
}

function openProductModal(id = null) {
    const modalEl = document.getElementById('productFormModal');
    const form = document.getElementById('productForm');
    const modalTitle = document.getElementById('productFormModalLabel');
    const submitBtn = document.getElementById('productSubmitBtn');

    // Reset Form & Upload States
    form.reset();
    document.getElementById('perfumeId').value = '';
    currentUploadedImageBase64 = null;
    document.getElementById('imagePreviewContainer').classList.add('d-none');
    document.getElementById('imagePreview').src = '';
    document.getElementById('perfumeImage').setAttribute('required', 'true');

    if (id) {
        // Edit Mode
        modalTitle.textContent = 'Editar Perfume';
        if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
        const products = getProducts();
        const product = products.find(p => p.id === id);

        if (product) {
            document.getElementById('perfumeId').value = product.id;
            document.getElementById('perfumeName').value = product.name;
            document.getElementById('perfumeStock').value = product.stock;
            document.getElementById('perfumeDesc').value = product.description;
            
            // Si la imagen es base64 (muy larga), la mostramos en el preview, si es corta en URL
            if (product.image.length > 500 || product.image.startsWith('data:image')) {
                currentUploadedImageBase64 = product.image;
                document.getElementById('imagePreview').src = product.image;
                document.getElementById('imagePreviewContainer').classList.remove('d-none');
                document.getElementById('perfumeImage').removeAttribute('required');
            } else {
                document.getElementById('perfumeImage').value = product.image;
            }
        }
    } else {
        // Create Mode
        modalTitle.textContent = 'Agregar Nuevo Perfume';
        if (submitBtn) submitBtn.textContent = 'Agregar Perfume';
    }

    const modalInstance = new bootstrap.Modal(modalEl);
    modalInstance.show();
}

function saveProduct() {
    const id = document.getElementById('perfumeId').value;
    const name = document.getElementById('perfumeName').value.trim();
    const stock = document.getElementById('perfumeStock').value;
    let urlImage = document.getElementById('perfumeImage').value.trim();
    const desc = document.getElementById('perfumeDesc').value.trim();

    // Prefer uploaded image over URL
    const finalImage = currentUploadedImageBase64 ? currentUploadedImageBase64 : urlImage;

    if (!name || !stock || !finalImage || !desc) {
        alert("Por favor, completa todos los campos (incluyendo Imagen o URL).");
        return;
    }

    let products = getProducts();

    if (id) {
        // Update
        const index = products.findIndex(p => p.id === id);
        if (index > -1) {
            products[index] = { id, name, stock: parseInt(stock), image: finalImage, description: desc };
        }
    } else {
        // Create
        const newId = 'P' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        products.unshift({
            id: newId,
            name,
            stock: parseInt(stock),
            image: finalImage,
            description: desc
        });
    }

    saveProducts(products);
    renderAdminTable();

    // Close Modal
    const modalEl = document.getElementById('productFormModal');
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    if (modalInstance) modalInstance.hide();
}

function deleteProduct(id) {
    if (confirm("¿Estás seguro de que deseas eliminar este perfume? Esta acción no se puede deshacer.")) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        renderAdminTable();
        
        // Remove related items from cart if necessary
        let cart = getCart();
        cart = cart.filter(item => item.id !== id);
        saveCart(cart);
    }
}
