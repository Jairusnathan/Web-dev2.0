document.addEventListener('DOMContentLoaded', function() {
    // Check if already logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Form submission handler
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // Check if user exists in localStorage
        const user = JSON.parse(localStorage.getItem(email));
        if (user && user.password === password) {
            // Set login status
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            alert('Login successful!');
            window.location.href = 'index.html';
        } else {
            alert('Invalid email or password.');
        }
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