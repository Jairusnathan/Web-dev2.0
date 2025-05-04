document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Logout functionality
    document.querySelector('.logout').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.setItem('isLoggedIn', 'false');
        localStorage.removeItem('currentUser');
        window.location.href = 'web.html';
    });

    // Contact form submission
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Validate form data
        if (!formData.name || !formData.email || !formData.subject || !formData.message) {
            showNotification('Please fill in all required fields.', 'error');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        // Phone validation (optional field)
        if (formData.phone) {
            const phoneRegex = /^\+?[\d\s-]{10,}$/;
            if (!phoneRegex.test(formData.phone)) {
                showNotification('Please enter a valid phone number.', 'error');
                return;
            }
        }

        // Here you would typically send the form data to a server
        // For now, we'll just show a success message
        showNotification('Thank you for your message! We will get back to you soon.', 'success');
        document.getElementById('contactForm').reset();
    });

    // Cart and Favorites Functionality
    const cartBtn = document.querySelector('.cart-icon');
    const favoritesBtn = document.querySelector('.favorites-icon');
    const cartDropdown = document.getElementById('cart-dropdown');
    const favoritesDropdown = document.getElementById('favorites-dropdown');
    const cartContent = document.getElementById('cart-content');
    const favoritesContent = document.getElementById('favorites-content');
    const cartCount = document.querySelector('.cart-count');
    const favoritesCount = document.querySelector('.favorites-count');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    // Load cart and favorites from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    // Update UI counters
    function updateCounters() {
        cartCount.textContent = cart.length;
        favoritesCount.textContent = favorites.length;
    }

    // Calculate and update total
    function updateTotal() {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartTotal.querySelector('span').textContent = `Total: $${total.toFixed(2)}`;
    }

    // Update cart display
    function updateCartDisplay() {
        if (cart.length === 0) {
            cartContent.innerHTML = '<p>Your cart is empty</p>';
        } else {
            cartContent.innerHTML = cart.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)}</p>
                        <div class="cart-item-controls">
                            <button class="quantity-btn minus">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn plus">+</button>
                            <button class="remove-btn">Remove</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
        updateTotal();
    }

    // Update favorites display
    function updateFavoritesDisplay() {
        if (favorites.length === 0) {
            favoritesContent.innerHTML = '<p>Your favorites list is empty</p>';
        } else {
            favoritesContent.innerHTML = favorites.map(item => `
                <div class="favorite-item" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                    <div class="cart-item-info">
                        <h4>${item.name}</h4>
                        <p>$${item.price.toFixed(2)}</p>
                        <div class="favorite-actions">
                            <button class="add-to-cart-btn" title="Add to Cart">
                                <i class='bx bx-cart-add'></i>
                            </button>
                            <button class="remove-favorite-btn" title="Remove from Favorites">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    // Toggle dropdowns
    cartBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cartDropdown.style.display = cartDropdown.style.display === 'block' ? 'none' : 'block';
        favoritesDropdown.style.display = 'none';
        updateCartDisplay();
    });

    favoritesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        favoritesDropdown.style.display = favoritesDropdown.style.display === 'block' ? 'none' : 'block';
        cartDropdown.style.display = 'none';
        updateFavoritesDisplay();
    });

    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!cartBtn.contains(e.target) && !cartDropdown.contains(e.target)) {
            cartDropdown.style.display = 'none';
        }
        if (!favoritesBtn.contains(e.target) && !favoritesDropdown.contains(e.target)) {
            favoritesDropdown.style.display = 'none';
        }
    });

    // Handle cart item quantity changes and removal
    cartContent.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        if (!cartItem) return;

        const itemId = cartItem.dataset.id;
        const itemIndex = cart.findIndex(item => item.id === itemId);

        if (e.target.classList.contains('plus')) {
            cart[itemIndex].quantity++;
            showNotification('Quantity increased!', 'success');
        } else if (e.target.classList.contains('minus')) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity--;
                showNotification('Quantity decreased!', 'success');
            }
        } else if (e.target.classList.contains('remove-btn')) {
            cart.splice(itemIndex, 1);
            showNotification('Item removed from cart!', 'success');
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartDisplay();
        updateCounters();
    });

    // Handle favorites actions
    favoritesContent.addEventListener('click', (e) => {
        const favoriteItem = e.target.closest('.favorite-item');
        if (!favoriteItem) return;

        const itemId = favoriteItem.dataset.id;
        const itemIndex = favorites.findIndex(item => item.id === itemId);

        if (e.target.closest('.add-to-cart-btn')) {
            const item = favorites[itemIndex];
            const existingCartItem = cart.find(cartItem => cartItem.id === item.id);

            if (existingCartItem) {
                existingCartItem.quantity++;
            } else {
                cart.push({ ...item, quantity: 1 });
            }

            localStorage.setItem('cart', JSON.stringify(cart));
            updateCounters();
            showNotification('Item added to cart!', 'success');
        } else if (e.target.closest('.remove-favorite-btn')) {
            favorites.splice(itemIndex, 1);
            localStorage.setItem('favorites', JSON.stringify(favorites));
            updateFavoritesDisplay();
            updateCounters();
            showNotification('Item removed from favorites!', 'success');
        }
    });

    // Checkout button
    checkoutBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('Your cart is empty!', 'error');
            return;
        }
        // Add checkout logic here
        showNotification('Checkout functionality coming soon!', 'success');
    });

    // Notification system
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Storage event listener to update cart and favorites when changed in another tab
    window.addEventListener('storage', (e) => {
        if (e.key === 'cart') {
            cart = JSON.parse(e.newValue) || [];
            updateCartDisplay();
            updateCounters();
        } else if (e.key === 'favorites') {
            favorites = JSON.parse(e.newValue) || [];
            updateFavoritesDisplay();
            updateCounters();
        }
    });

    // Initialize displays
    updateCounters();
    updateCartDisplay();
    updateFavoritesDisplay();
}); 