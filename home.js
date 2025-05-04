// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!isLoggedIn || !currentUser) {
        // If not logged in, redirect back to web.html
        window.location.href = 'web.html';
        return;
    }

    // Handle logout
    document.getElementById('logout').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = 'web.html';
    });

    // Toggle menu for mobile
    document.getElementById('menu-icon').addEventListener('click', function() {
        document.getElementById('navbar').classList.toggle('active');
    });

    // Cart functionality
    const cartBtn = document.getElementById('cart-btn');
    const cartDropdown = document.getElementById('cart-dropdown');
    const cartContent = document.getElementById('cart-content');
    const cartCount = document.querySelector('.cart-count');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Favorites functionality
    const favBtn = document.getElementById('favorites-btn');
    const favDropdown = document.getElementById('favorites-dropdown');
    const favContent = document.getElementById('favorites-content');
    const favCount = document.querySelector('.favorites-count');
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    setupEventListeners();
    updateCartUI();
    updateFavoritesUI();
    setupDropdownPositioning();

    function setupEventListeners() {
        // Cart dropdown toggle with improved handling
        cartBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = cartDropdown.classList.contains('show');
            hideAllDropdowns();
            if (!isVisible) {
                showDropdown(cartDropdown);
                updateDropdownPosition(cartDropdown, cartBtn);
            }
        });

        // Favorites dropdown toggle with improved handling
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isVisible = favDropdown.classList.contains('show');
            hideAllDropdowns();
            if (!isVisible) {
                showDropdown(favDropdown);
                updateDropdownPosition(favDropdown, favBtn);
            }
        });

        // Close dropdowns when clicking outside
        document.addEventListener('click', hideAllDropdowns);

        // Prevent dropdown close when clicking inside
        [cartDropdown, favDropdown].forEach(dropdown => {
            dropdown.addEventListener('click', (e) => e.stopPropagation());
        });

        // Handle window resize
        window.addEventListener('resize', () => {
            if (cartDropdown.classList.contains('show')) {
                updateDropdownPosition(cartDropdown, cartBtn);
            }
            if (favDropdown.classList.contains('show')) {
                updateDropdownPosition(favDropdown, favBtn);
            }
        });

        // Handle scroll
        window.addEventListener('scroll', () => {
            if (cartDropdown.classList.contains('show')) {
                updateDropdownPosition(cartDropdown, cartBtn);
            }
            if (favDropdown.classList.contains('show')) {
                updateDropdownPosition(favDropdown, favBtn);
            }
        }, { passive: true });

        // Checkout button
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                window.location.href = 'checkout.html';
            });
        }

        // Add quantity control event listeners
        cartContent.addEventListener('click', (e) => {
            if (e.target.classList.contains('decrease-quantity') || e.target.classList.contains('increase-quantity')) {
                const productId = parseInt(e.target.getAttribute('data-id'));
                const isIncrease = e.target.classList.contains('increase-quantity');
                updateQuantity(productId, isIncrease);
            }
        });
    }

    function setupDropdownPositioning() {
        // Add positioning styles to dropdowns
        [cartDropdown, favDropdown].forEach(dropdown => {
            dropdown.style.position = 'fixed';
            dropdown.style.zIndex = '1000';
            dropdown.classList.add('dropdown-menu');
        });
    }

    function showDropdown(dropdown) {
        dropdown.classList.add('show');
        dropdown.style.display = 'block';
    }

    function hideAllDropdowns() {
        [cartDropdown, favDropdown].forEach(dropdown => {
            dropdown.classList.remove('show');
            dropdown.style.display = 'none';
        });
    }

    function updateDropdownPosition(dropdown, button) {
        const buttonRect = button.getBoundingClientRect();
        const dropdownRect = dropdown.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Calculate the available space below and above the button
        const spaceBelow = windowHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Default position (below button)
        let top = buttonRect.bottom + window.scrollY;
        let left = Math.max(0, Math.min(buttonRect.left, windowWidth - dropdownRect.width));

        // If there's not enough space below, show above
        if (spaceBelow < dropdownRect.height && spaceAbove > dropdownRect.height) {
            top = buttonRect.top - dropdownRect.height + window.scrollY;
        }

        // Apply the position
        dropdown.style.top = `${top}px`;
        dropdown.style.left = `${left}px`;
        
        // Add max-height and overflow for scrolling if needed
        const maxHeight = Math.min(400, windowHeight - 20);
        dropdown.style.maxHeight = `${maxHeight}px`;
        dropdown.style.overflowY = 'auto';
    }

    function updateQuantity(productId, isIncrease) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (isIncrease) {
                item.quantity += 1;
            } else if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(item => item.id !== productId);
            }
            saveToStorage();
            updateCartUI();
        }
    }

    function updateCartUI() {
        // Update count
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        
        // Update content
        if (cart.length === 0) {
            cartContent.innerHTML = '<p class="text-center py-3">Your cart is empty</p>';
            if (cartTotal) cartTotal.style.display = 'none';
            if (checkoutBtn) checkoutBtn.style.display = 'none';
        } else {
            cartContent.innerHTML = '';
            let total = 0;
            
            cart.forEach(item => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
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
                                <small class="text-muted ms-2">× $${item.price.toLocaleString()}</small>
                            </div>
                        </div>
                    </div>
                    <div class="fw-bold">$${itemTotal.toLocaleString()}</div>
                `;
                cartContent.appendChild(cartItem);
            });
            
            // Add total and checkout button
            if (cartTotal) {
                cartTotal.style.display = 'block';
                cartTotal.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center border-top pt-3">
                        <span class="fw-bold">Total:</span>
                        <span class="fw-bold">$${total.toLocaleString()}</span>
                    </div>
                `;
            }
            
            if (checkoutBtn) {
                checkoutBtn.style.display = 'block';
            }
        }
    }

    function updateFavoritesUI() {
        favCount.textContent = favorites.length;
        
        if (favorites.length === 0) {
            favContent.innerHTML = '<p class="text-center py-3">Your favorites list is empty</p>';
        } else {
            favContent.innerHTML = favorites.map(item => `
                <div class="cart-item">
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-info">
                            <h6 class="mb-1">${item.name}</h6>
                            <p class="mb-0">$${item.price.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }

    function saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
});

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    notification.style.zIndex = '1000';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}
