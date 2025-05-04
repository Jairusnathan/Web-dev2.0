document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    console.log('Login status:', isLoggedIn);
    
    // Get all protected links
    const protectedLinks = document.querySelectorAll('a[href="about.html"], a[href="services.html"], a[href="contact.html"], a[href="index.html"]');
    console.log('Found protected links:', protectedLinks.length);
    
    // Add click event listeners to protected links
    protectedLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Link clicked:', link.href);
            if (!isLoggedIn) {
                e.preventDefault();
                window.location.href = 'login.html';
            } else {
                // If logged in, allow the navigation but ensure it's not prevented
                return true;
            }
        });
    });

    // Handle menu icon click for mobile navigation
    const menuIcon = document.getElementById('menu-icon');
    const navbar = document.getElementById('navbar');
    
    if (menuIcon && navbar) {
        menuIcon.addEventListener('click', () => {
            navbar.classList.toggle('active');
        });
    }

    // Add direct navigation handler for contact page
    const contactLinks = document.querySelectorAll('a[href="contact.html"]');
    contactLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Contact link clicked, login status:', isLoggedIn);
            if (!isLoggedIn) {
                e.preventDefault();
                window.location.href = 'login.html';
            } else {
                // If logged in, allow the navigation
                window.location.href = 'contact.html';
            }
        });
    });

    // Slider functionality
    const slider = document.querySelector('.slider');
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');
    const dots = document.querySelectorAll('.dot');
    
    let currentSlide = 0;
    const slideCount = slides.length;
    
    // Function to update slider position
    function updateSlider() {
        slider.style.transform = `translateX(-${currentSlide * 100}%)`;
        
        // Update dots
        dots.forEach(dot => dot.classList.remove('active'));
        dots[currentSlide].classList.add('active');
    }
    
    // Next slide
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slideCount;
        updateSlider();
    }
    
    // Previous slide
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slideCount) % slideCount;
        updateSlider();
    }
    
    // Event listeners for buttons
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', prevSlide);
    
    // Event listeners for dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentSlide = index;
            updateSlider();
        });
    });
    
    // Auto slide every 5 seconds
    setInterval(nextSlide, 5000);
}); 