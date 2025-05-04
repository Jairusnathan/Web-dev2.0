// State
let cart = [];
let favorites = [];

// DOM Elements
const menuIcon = document.getElementById('menu-icon');
const navbar = document.getElementById('navbar');
const cartBtn = document.getElementById('cart-btn');
const cartDropdown = document.getElementById('cart-dropdown');
const cartContent = document.getElementById('cart-content');
const cartCount = document.querySelector('.cart-count');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');
const favoritesBtn = document.getElementById('favorites-btn');
const favoritesDropdown = document.getElementById('favorites-dropdown');
const favoritesContent = document.getElementById('favorites-content');
const favoritesCount = document.querySelector('.favorites-count');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    updateCartUI();
    updateFavoritesUI();
    setupEventListeners();
    setupDragAndDrop();
});

function setupEventListeners() {
    // Menu toggle
    menuIcon.addEventListener('click', () => {
        navbar.classList.toggle('active');
    });

    // Cart dropdown toggle
    cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
        favoritesDropdown.style.display = 'none';
    });

    // Favorites dropdown toggle
    favoritesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        favoritesDropdown.style.display = favoritesDropdown.style.display === 'block' ? 'none' : 'block';
        cartDropdown.style.display = 'none';
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', () => {
        cartDropdown.style.display = 'none';
        favoritesDropdown.style.display = 'none';
    });

    // Prevent dropdown close when clicking inside
    cartDropdown.addEventListener('click', (e) => e.stopPropagation());
    favoritesDropdown.addEventListener('click', (e) => e.stopPropagation());

    // Checkout button
    checkoutBtn.addEventListener('click', checkout);
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            addToCart(productId);
        });
    });
    
    // Favorite buttons
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            toggleFavorite(productId);
            e.target.classList.toggle('bxs-heart');
            e.target.classList.toggle('text-danger');
            e.target.classList.toggle('bx-heart');
        });
    });
    
    // Global drag end event
    document.addEventListener('dragend', (e) => {
        document.querySelectorAll('.dragging').forEach(el => {
            el.classList.remove('dragging');
        });
        document.querySelector('.cart-icon').classList.remove('cart-drag-over');
    });
}

// Setup drag and drop
function setupDragAndDrop() {
    // Make product cards draggable
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
    });
    
    // Make cart droppable
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.addEventListener('dragover', handleDragOver);
    cartIcon.addEventListener('dragleave', handleDragLeave);
    cartIcon.addEventListener('drop', handleDrop);
}

// Drag event handlers
function handleDragStart(e) {
    const productId = e.currentTarget.getAttribute('data-id');
    e.dataTransfer.setData('text/plain', productId);
    e.currentTarget.classList.add('dragging');
    
    const dragImage = e.currentTarget.querySelector('.card-img-top').cloneNode(true);
    dragImage.style.width = '100px';
    dragImage.style.height = '60px';
    dragImage.style.borderRadius = '8px';
    dragImage.style.objectFit = 'cover';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    
    e.dataTransfer.setDragImage(dragImage, 50, 30);
    
    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('cart-drag-over');
}

function handleDragLeave(e) {
    e.currentTarget.classList.remove('cart-drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('cart-drag-over');
    const productId = parseInt(e.dataTransfer.getData('text/plain'));
    addToCart(productId);
    animateCartDrop(e.clientX, e.clientY);
}

// Cart Functions
function addToCart(productId) {
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    if (!productCard) return;
    
    const productName = productCard.querySelector('.card-title').textContent;
    const productPrice = parseFloat(productCard.querySelector('.text-primary').textContent.replace('$', '').replace(',', ''));
    const productImage = productCard.querySelector('.product-img').src;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }
    
    saveToStorage();
    updateCartUI();
    showNotification(`${productName} added to cart!`);
}

function updateCartUI() {
    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update content
    if (cart.length === 0) {
        cartContent.innerHTML = '<p>Your cart is empty</p>';
        cartTotal.style.display = 'none';
    } else {
        cartContent.innerHTML = '';
        let total = 0;
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h6 class="mb-1">${item.name}</h6>
                        <div class="cart-item-quantity">
                            <button class="btn btn-sm btn-outline-secondary cart-item-quantity-btn decrease-quantity" data-id="${item.id}">-</button>
                            <span class="mx-2">${item.quantity}</span>
                            <button class="btn btn-sm btn-outline-secondary cart-item-quantity-btn increase-quantity" data-id="${item.id}">+</button>
                            <small class="text-muted ms-2">x $${item.price.toLocaleString()}</small>
                        </div>
                    </div>
                </div>
                <div class="fw-bold">$${(item.price * item.quantity).toLocaleString()}</div>
            `;
            cartContent.appendChild(cartItem);
            
            total += item.price * item.quantity;
        });
        
        // Update total
        cartTotal.querySelector('span').textContent = `Total: $${total.toLocaleString()}`;
        cartTotal.style.display = 'flex';
    }
    
    // Add event listeners to quantity buttons
    document.querySelectorAll('.increase-quantity').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity += 1;
                saveToStorage();
                updateCartUI();
            }
        });
    });
    
    document.querySelectorAll('.decrease-quantity').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.getAttribute('data-id'));
            const itemIndex = cart.findIndex(item => item.id === productId);
            
            if (itemIndex !== -1) {
                if (cart[itemIndex].quantity > 1) {
                    cart[itemIndex].quantity -= 1;
                } else {
                    cart.splice(itemIndex, 1);
                }
                saveToStorage();
                updateCartUI();
            }
        });
    });
}

// Favorites Functions
function toggleFavorite(productId) {
    const index = favorites.findIndex(item => item.id === productId);
    const productCard = document.querySelector(`.product-card[data-id="${productId}"]`);
    
    if (!productCard) return;
    
    const productName = productCard.querySelector('.card-title').textContent;
    const productPrice = parseFloat(productCard.querySelector('.text-primary').textContent.replace('$', '').replace(',', ''));
    const productImage = productCard.querySelector('.product-img').src;
    
    if (index !== -1) {
        favorites.splice(index, 1);
    } else {
        favorites.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            isFavorite: true
        });
    }
    
    saveToStorage();
    updateFavoritesUI();
}

function updateFavoritesUI() {
    // Update count
    favoritesCount.textContent = favorites.length;
    
    // Update content
    if (favorites.length === 0) {
        favoritesContent.innerHTML = '<p>Your favorites list is empty</p>';
    } else {
        favoritesContent.innerHTML = '';
        
        favorites.forEach(item => {
            const favItem = document.createElement('div');
            favItem.className = 'd-flex justify-content-between align-items-center py-2 border-bottom';
            favItem.innerHTML = `
                <div class="d-flex align-items-center">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div>
                        <h6 class="mb-1">${item.name}</h6>
                        <small class="text-muted">$${item.price.toLocaleString()}</small>
                    </div>
                </div>
                <div>
                    <button class="btn btn-sm btn-outline-primary add-to-cart-from-fav" data-id="${item.id}">
                        <i class='bx bx-cart-add'></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger remove-favorite" data-id="${item.id}">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            `;
            favoritesContent.appendChild(favItem);
        });
    }
    
    // Add event listeners
    document.querySelectorAll('.add-to-cart-from-fav').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            addToCart(productId);
        });
    });
    
    document.querySelectorAll('.remove-favorite').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('button').getAttribute('data-id'));
            toggleFavorite(productId);
            const heartIcon = document.querySelector(`.favorite-btn[data-id="${productId}"]`);
            if (heartIcon) {
                heartIcon.classList.toggle('bxs-heart');
                heartIcon.classList.toggle('text-danger');
                heartIcon.classList.toggle('bx-heart');
            }
        });
    });
}

// Storage Functions
function saveToStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

function loadFromStorage() {
    const savedCart = localStorage.getItem('cart');
    const savedFavorites = localStorage.getItem('favorites');
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedFavorites) favorites = JSON.parse(savedFavorites);
    
    // Update favorite button states
    favorites.forEach(item => {
        const heartIcon = document.querySelector(`.favorite-btn[data-id="${item.id}"]`);
        if (heartIcon) {
            heartIcon.classList.add('bxs-heart', 'text-danger');
            heartIcon.classList.remove('bx-heart');
        }
    });
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!', 'warning');
        return;
    }
    window.location.href = 'checkout.html';
}

// Animation for dropping products into cart
function animateCartDrop(x, y) {
    const cartIconRect = document.querySelector('.cart-icon').getBoundingClientRect();
    const cartX = cartIconRect.left + cartIconRect.width / 2;
    const cartY = cartIconRect.top + cartIconRect.height / 2;
    
    const element = document.createElement('div');
    element.className = 'animate-to-cart';
    element.style.left = `${x}px`;
    element.style.top = `${y}px`;
    document.body.appendChild(element);
    
    setTimeout(() => {
        element.style.transform = `translate(${cartX - x}px, ${cartY - y}px) scale(0.1)`;
        element.style.opacity = '0';
    }, 10);
    
    setTimeout(() => {
        document.body.removeChild(element);
    }, 500);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.right = '20px';
    }, 10);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.style.right = '-300px';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 500);
    }, 3000);
}

// Responsive behavior
window.addEventListener('resize', () => {
    if (window.innerWidth > 991) {
        navbar.classList.remove('active');
    }
});