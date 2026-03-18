// OFF ESSENCE - Database Logic & Seed (Local DB)

const DB_PRODUCTS_KEY = 'off_essence_products';
const DB_CART_KEY = 'off_essence_cart';

// Default Luxury Perfumes Seed
const defaultProducts = [
    {
        id: 'P001',
        name: 'Noir Éternel',
        description: 'Una mezcla profunda y oscura de oud, ámbar y especias orientales. Perfecto para la noche.',
        image: 'https://images.unsplash.com/photo-1594035919831-f1115b8dfacb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHw0fHxwZXJmdW1lfGVufDB8fHx8MTcxMTMwMTY2N3ww&ixlib=rb-4.0.3&q=80&w=600',
        stock: 50
    },
    {
        id: 'P002',
        name: 'Aura Blanche',
        description: 'Floral luminoso con notas de jazmín puro, lirio del valle y almizcle blanco sedoso.',
        image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHwyfHxwZXJmdW1lfGVufDB8fHx8MTcxMTMwMTY2N3ww&ixlib=rb-4.0.3&q=80&w=600',
        stock: 35
    },
    {
        id: 'P003',
        name: 'Santal Impérial',
        description: 'Poderoso sándalo de la india, maderas preciosas y destellos de bergamota. Refinamiento puro.',
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHw3fHxwZXJmdW1lfGVufDB8fHx8MTcxMTMwMTY2N3ww&ixlib=rb-4.0.3&q=80&w=600',
        stock: 20
    },
    {
        id: 'P004',
        name: 'Rose d\'Or',
        description: 'Rosas turcas aterciopeladas en un abrazo de vainilla dorada y maderas ahumadas.',
        image: 'https://images.unsplash.com/photo-1594035919623-a26189cd2e6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHw1fHxwZXJmdW1lfGVufDB8fHx8MTcxMTMwMTY2N3ww&ixlib=rb-4.0.3&q=80&w=600',
        stock: 12
    },
    {
        id: 'P005',
        name: 'Vétiver Privé',
        description: 'El frescor terroso del vetiver haitiano combinado con cítricos vibrantes y pimienta rosa.',
        image: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHwxMnx8cGVyZnVtZXxlbnwwfHx8fDE3MTEzMDE2Njd8MA&ixlib=rb-4.0.3&q=80&w=600',
        stock: 5
    },
    {
        id: 'P006',
        name: 'Luminous',
        description: 'Exquisita combinación de manzana verde, cítricos y maderas nobles. Frescura absoluta.',
        image: 'https://images.unsplash.com/photo-1608682057912-1ce80e14cb7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3wxMTgwOTN8MHwxfHNlYXJjaHwyM3x8cGVyZnVtZXxlbnwwfHx8fDE3MTEzMDU3OTl8MA&ixlib=rb-4.0.3&q=80&w=600',
        stock: 40
    }
];

function initDB() {
    if (!localStorage.getItem(DB_PRODUCTS_KEY)) {
        localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(defaultProducts));
    }
    
    if (!localStorage.getItem(DB_CART_KEY)) {
        localStorage.setItem(DB_CART_KEY, JSON.stringify([]));
    }
}

function getProducts() {
    return JSON.parse(localStorage.getItem(DB_PRODUCTS_KEY)) || [];
}

function saveProducts(products) {
    localStorage.setItem(DB_PRODUCTS_KEY, JSON.stringify(products));
}

function getCart() {
    return JSON.parse(localStorage.getItem(DB_CART_KEY)) || [];
}

function saveCart(cart) {
    localStorage.setItem(DB_CART_KEY, JSON.stringify(cart));
}

// Initializer
initDB();
