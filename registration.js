document.addEventListener('DOMContentLoaded', function() {
    // Form submission handler
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Check if passwords match
        if (password !== confirmPassword) {
            alert('Passwords do not match.');
            return;
        }

        // Check if user already exists
        if (localStorage.getItem(email)) {
            alert('User already exists with this email.');
            return;
        }

        // Store user data in localStorage
        const userData = {
            name: name,
            email: email,
            password: password
        };
        localStorage.setItem(email, JSON.stringify(userData));
        alert('Registration successful! You can now log in.');
        
        // Redirect to login page
        window.location.href = 'login.html';
    });

    // Social login buttons (placeholder functionality)
    const socialButtons = document.querySelectorAll('.btn-facebook, .btn-google, .btn-apple');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Social login functionality coming soon!');
        });
    });
}); 