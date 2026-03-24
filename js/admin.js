// OFF ESSENCE - Admin Panel Logic
import { getProducts, addProduct, updateProduct, deleteProductFromDB } from './data.js';

let currentUploadedImageBase64 = null;
let editingProductId = null; // Para saber si estamos editando o creando
let globalProductsCache = []; // Cache para evitar llamadas extra al editar

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    renderAdminTable(); // Ahora asincrono pero no bloquea

    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSaveProduct();
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
                    const urlField = document.getElementById('perfumeImage');
                    if(urlField) {
                        urlField.value = '';
                        urlField.removeAttribute('required');
                    }
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

// Exponer logoutAdmin a window
window.logoutAdmin = function() {
    sessionStorage.removeItem('off_essence_admin');
    window.location.href = 'index.html';
};

async function renderAdminTable() {
    const tableBody = document.getElementById('adminProductTable');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-4">Cargando inventario...</td></tr>';
    
    try {
        globalProductsCache = await getProducts();
        
        tableBody.innerHTML = '';
        if (globalProductsCache.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">No hay perfumes registrados en el inventario.</td>
                </tr>
            `;
            return;
        }

        globalProductsCache.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td class="ps-4">
                    <img src="${product.image}" alt="${product.name}" class="admin-table-img border border-light shadow-sm">
                </td>
                <td>
                    <div class="font-serif fw-bold text-primary-dark">${product.name}</div>
                    <div class="small text-muted fst-italic">${product.category || 'Sin categoría'}</div>
                </td>
                <td>
                    <div class="text-muted small text-truncate" style="max-width: 200px;">${product.description}</div>
                    <div class="fw-bold text-primary-dark mt-1">$${parseFloat(product.price || 0).toFixed(2)}</div>
                </td>
                <td class="font-sans fw-semibold ${product.stock < 10 ? 'text-danger' : 'text-success'}">${product.stock}</td>
                <td class="text-end pe-4">
                    <div class="btn-group">
                        <button class="btn btn-sm btn-outline-dark" onclick="window.openProductModal('${product.id}')">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="window.deleteProduct('${product.id}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-danger py-4">Error al cargar inventario: ${error.message}</td></tr>`;
    }
}

// Exponer funciones necesarias para el HTML (onclick)
window.openProductModal = function(productId = null) {
    const modalEl = document.getElementById('productFormModal') || document.getElementById('productModal');
    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) {
        modal = new bootstrap.Modal(modalEl);
    }
    
    const titleEl = document.getElementById('productFormModalLabel') || document.getElementById('productModalLabel');
    const form = document.getElementById('productForm');
    
    // Reset form UI
    form.reset();
    document.getElementById('imagePreviewContainer').classList.add('d-none');
    document.getElementById('imagePreview').src = '';
    currentUploadedImageBase64 = null;
    
    // Reset required
    document.getElementById('perfumeImage').setAttribute('required', 'true');

    if (productId) {
        // Edit Mode
        editingProductId = productId;
        if(titleEl) titleEl.textContent = 'Editar Perfume';
        
        const product = globalProductsCache.find(p => p.id === productId);
        if (product) {
            document.getElementById('perfumeName').value = product.name;
            document.getElementById('perfumePrice').value = product.price || '';
            document.getElementById('perfumeCategory').value = product.category || '';
            document.getElementById('perfumeDesc').value = product.description;
            document.getElementById('perfumeStock').value = product.stock;
            document.getElementById('perfumeImage').value = product.image;
            
            // Mostrar preview
            const previewContainer = document.getElementById('imagePreviewContainer');
            const previewImage = document.getElementById('imagePreview');
            previewImage.src = product.image;
            previewContainer.classList.remove('d-none');
            
            document.getElementById('perfumeImage').removeAttribute('required');
        }
    } else {
        // Create Mode
        editingProductId = null;
        if(titleEl) titleEl.textContent = 'Nuevo Perfume';
    }

    modal.show();
};

window.deleteProduct = async function(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este perfume?')) {
        try {
            await deleteProductFromDB(id);
            await renderAdminTable(); // Recargar tabla
        } catch (error) {
            alert('Error al eliminar: ' + error.message);
        }
    }
};

async function handleSaveProduct() {
    const name = document.getElementById('perfumeName').value;
    const price = parseFloat(document.getElementById('perfumePrice').value) || 0;
    const category = document.getElementById('perfumeCategory').value;
    const desc = document.getElementById('perfumeDesc').value;
    const stock = parseInt(document.getElementById('perfumeStock').value) || 0;
    
    // Prioridad: Imagen subida (Base64) > URL ingresada > URL existente (si editamos)
    let image = document.getElementById('perfumeImage').value;
    if (currentUploadedImageBase64) {
        image = currentUploadedImageBase64;
    }

    const productData = {
        name: name,
        price: price,
        category: category, 
        description: desc,
        stock: stock,
        image: image || 'placeholder.jpg'
    };
    
    const modalEl = document.getElementById('productFormModal') || document.getElementById('productModal');
    let modal = bootstrap.Modal.getInstance(modalEl);
    if(!modal) modal = new bootstrap.Modal(modalEl); 

    const btnSubmit = document.getElementById('productSubmitBtn') || document.querySelector('button[type="submit"]');

    try {
        if(btnSubmit) {
             btnSubmit.disabled = true;
             btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...';
        }

        if (editingProductId) {
            await updateProduct(editingProductId, productData);
        } else {
            await addProduct(productData);
        }
        
        modal.hide();
        // Limpiar backdrop residual
        const backdrops = document.querySelectorAll('.modal-backdrop');
        if(backdrops.length > 0) {
           backdrops.forEach(b => b.remove());
           document.body.classList.remove('modal-open');
           document.body.style = '';
        }

        await renderAdminTable(); 
        
    } catch (error) {
        alert('Error al guardar el producto: ' + error.message);
    } finally {
        if(btnSubmit) {
             btnSubmit.disabled = false;
             btnSubmit.innerHTML = 'Guardar Perfume';
        }
    }
}
