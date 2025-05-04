document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!isLoggedIn || !currentUser) {
        window.location.href = 'web.html';
        return;
    }

    // Get cart items from localStorage
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Update cart count
    document.querySelector('.cart-count').textContent = cartItems.length;

    // Populate cart summary
    const cartSummary = document.getElementById('cart-summary');
    let total = 0;

    if (cartItems.length === 0) {
        cartSummary.innerHTML = `
            <li class="list-group-item">
                <div class="cart-item-details">
                    <span>Your cart is empty</span>
                </div>
            </li>
        `;
        // Disable checkout button and show message
        const submitButton = document.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = 'Cart is Empty';
        
        // Add a return to shopping message
        cartSummary.innerHTML += `
            <li class="list-group-item bg-light">
                <div class="text-center">
                    <p class="mb-2">Your shopping cart is empty</p>
                    <a href="index.html" class="btn btn-outline-danger">Return to Shopping</a>
                </div>
            </li>
        `;
    } else {
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;

            cartSummary.innerHTML += `
                <li class="list-group-item">
                    <div class="cart-item-details">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-name">
                            <h6>${item.name}</h6>
                            <small>Quantity: ${item.quantity} × $${item.price.toLocaleString()}</small>
                        </div>
                        <span class="cart-item-price">$${itemTotal.toLocaleString()}</span>
                    </div>
                </li>
            `;
        });

        // Add total
        cartSummary.innerHTML += `
            <li class="list-group-item">
                <div class="cart-item-details">
                    <span class="fw-bold">Total</span>
                    <span class="cart-total">$${total.toLocaleString()}</span>
                </div>
            </li>
        `;
    }

    // Form validation and submission
    const form = document.getElementById('payment-form');
    const cardNumberInput = document.getElementById('cardNumber');
    const expMonthInput = document.getElementById('expMonth');
    const expYearInput = document.getElementById('expYear');
    const cvvInput = document.getElementById('cvv');

    // Card number formatting
    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(.{4})/g, '$1 ').trim();
        e.target.value = value.substring(0, 19);
    });

    // Expiry month formatting
    expMonthInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 2) value = value.slice(0, 2);
        if (parseInt(value) > 12) value = '12';
        e.target.value = value;
    });

    // Expiry year formatting
    expYearInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        e.target.value = value;
    });

    // CVV formatting
    cvvInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        e.target.value = value;
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!form.checkValidity()) {
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }

        const submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;
        submitButton.innerHTML = `
            Processing...
            <div class="spinner-border spinner-border-sm loading-spinner" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        `;

        try {
            // Simulate payment processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Clear cart in localStorage
            localStorage.setItem('cart', '[]');

            // Show success message
            showNotification('Payment successful! Thank you for your purchase.', 'success');

            // Redirect to home page after 2 seconds
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);

        } catch (error) {
            console.error('Payment failed:', error);
            showNotification('Payment failed. Please try again.', 'error');
            submitButton.disabled = false;
            submitButton.innerHTML = 'Complete Purchase';
        }
    });
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
    notification.style.zIndex = '1000';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
} 