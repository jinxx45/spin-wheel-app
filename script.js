// Application State
let userEmail = '';
let isSpinning = false;

// DOM Elements
const emailSection = document.getElementById('email-section');
const wheelSection = document.getElementById('wheel-section');
const resultSection = document.getElementById('result-section');
const loadingOverlay = document.getElementById('loading');
const emailForm = document.getElementById('email-form');
const emailInput = document.getElementById('email-input');
const wheel = document.getElementById('wheel');
const spinButton = document.getElementById('spin-button');
const discountAmount = document.getElementById('discount-amount');
const userEmailDisplay = document.getElementById('user-email');

// Wheel Configuration (visual segments) - Center angles for each 60-degree segment
const segments = [
    { prize: '5% OFF', centerAngle: 30, type: 'discount' },     // Segment 1: 0-60 degrees (center at 30°)
    { prize: '10% OFF', centerAngle: 90, type: 'discount' },    // Segment 2: 60-120 degrees (center at 90°)
    { prize: 'Spin again', centerAngle: 150, type: 'retry' },   // Segment 3: 120-180 degrees (center at 150°)
    { prize: 'Better luck next time', centerAngle: 210, type: 'nothing' }, // Segment 4: 180-240 degrees (center at 210°)
    { prize: 'Free scrunchie', centerAngle: 270, type: 'gift' }, // Segment 5: 240-300 degrees (center at 270°)
    { prize: '20% OFF', centerAngle: 330, type: 'discount' }    // Segment 6: 300-360 degrees (center at 330°) - DECOY
];

// Actual possible winning segments (20% OFF excluded)
const allSegments = [
    { prize: '5% OFF', centerAngle: 30, type: 'discount' },
    { prize: '10% OFF', centerAngle: 90, type: 'discount' },
    { prize: 'Spin again', centerAngle: 150, type: 'retry' },
    { prize: 'Better luck next time', centerAngle: 210, type: 'nothing' },
    { prize: 'Free scrunchie', centerAngle: 270, type: 'gift' }
    // Note: 20% OFF at 330° is intentionally excluded from possible wins
];

// Email Form Handler
emailForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    if (!email || !isValidEmail(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    userEmail = email;
    
    // Show loading overlay
    showLoading();
    
    try {
        // Save email to database
        await saveEmailToDatabase(email);
        
        // Hide loading and transition to wheel
        hideLoading();
        transitionToWheel();
    } catch (error) {
        console.error('Error saving email:', error);
        hideLoading();
        alert('There was an error processing your request. Please try again.');
    }
});

// Email Validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Database Functions
async function saveEmailToDatabase(email) {
    // Check if we're running locally via file:// protocol
    if (window.location.protocol === 'file:') {
        console.log('Running locally - email would be saved:', email);
        // Simulate a successful save for local development
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, message: 'Email saved locally (demo mode)' });
            }, 1000);
        });
    }
    
    // Use different URL based on environment for actual deployments
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const apiUrl = isLocalhost ? '/.netlify/functions/save-email' : '/api/save-email';
    
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                email: email,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Email saved successfully:', result);
        return result;
    } catch (error) {
        console.error('Error saving email:', error);
        // For demo purposes, we'll continue even if email saving fails
        // In production, you might want to handle this differently
        return { success: false, error: error.message };
    }
}

// Section Transitions
function transitionToWheel() {
    emailSection.classList.remove('active');
    setTimeout(() => {
        wheelSection.classList.add('active');
    }, 300);
}

function transitionToResult() {
    wheelSection.classList.remove('active');
    setTimeout(() => {
        resultSection.classList.add('active');
    }, 300);
}

// Loading Overlay
function showLoading() {
    loadingOverlay.classList.add('active');
}

function hideLoading() {
    loadingOverlay.classList.remove('active');
}

// Spin Wheel Logic
spinButton.addEventListener('click', function() {
    if (isSpinning) return;
    
    spinWheel();
});

function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    spinButton.disabled = true;
    spinButton.textContent = 'SPINNING...';
    
    // Randomly select a winning segment from allowed segments only
    const winningSegment = allSegments[Math.floor(Math.random() * allSegments.length)];
    
    // Calculate the final rotation
    const baseRotations = 5; // Number of full rotations for dramatic effect
    const randomOffset = Math.random() * 30 - 15; // Add randomness (-15 to +15 degrees)
    
    // Calculate target angle - we want the winning segment's center to align with the pointer (top)
    // The pointer is at 0 degrees (12 o'clock), so we need to rotate the wheel
    // so that the winning segment's center angle points to the top
    const targetAngle = 360 - winningSegment.centerAngle + randomOffset;
    const finalRotation = (baseRotations * 360) + targetAngle;
    
    // Apply rotation
    wheel.style.transform = `rotate(${finalRotation}deg)`;
    
    // Wait for animation to complete
    setTimeout(() => {
        showResult(winningSegment.prize, winningSegment.type);
        isSpinning = false;
        spinButton.disabled = false;
        spinButton.textContent = 'SPIN';
    }, 3000);
}

// Show Result
function showResult(prize, type) {
    discountAmount.textContent = prize;
    userEmailDisplay.textContent = userEmail;
    
    // Update result text based on prize type
    const resultText = document.querySelector('.result-content > p');
    const resultEmailText = document.querySelector('.result-email');
    const shopButton = document.querySelector('.shop-now-btn');
    
    if (type === 'retry') {
        resultText.textContent = 'Spin the wheel again for another chance!';
        if (resultEmailText) resultEmailText.style.display = 'none';
        if (shopButton) shopButton.textContent = 'Spin Again';
    } else if (type === 'nothing') {
        resultText.textContent = 'Don\'t worry, you can try again later!';
        if (resultEmailText) resultEmailText.style.display = 'none';
        if (shopButton) shopButton.textContent = 'Try Again';
    } else if (type === 'gift') {
        resultText.textContent = 'Congratulations! You won a free gift!';
        if (resultEmailText) resultEmailText.style.display = 'block';
        if (shopButton) shopButton.textContent = 'Claim Gift';
    } else {
        resultText.textContent = 'Your exclusive discount has been applied!';
        if (resultEmailText) resultEmailText.style.display = 'block';
        if (shopButton) shopButton.textContent = 'Shop Now';
    }
    
    setTimeout(() => {
        transitionToResult();
    }, 500);
}

// Reset Application
function resetApp() {
    // Reset state
    userEmail = '';
    isSpinning = false;
    emailInput.value = '';
    
    // Reset wheel rotation
    wheel.style.transform = 'rotate(0deg)';
    
    // Reset sections
    resultSection.classList.remove('active');
    wheelSection.classList.remove('active');
    setTimeout(() => {
        emailSection.classList.add('active');
    }, 300);
}

// Shop Now Button Handler - Use event delegation to handle dynamically added button
document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('shop-now-btn')) {
        const prize = discountAmount.textContent;
        const buttonText = e.target.textContent;
        
        if (buttonText === 'Spin Again' || buttonText === 'Try Again') {
            // Reset to wheel section for another spin
            resetToWheel();
        } else if (buttonText === 'Claim Gift') {
            alert(`Congratulations! Your free scrunchie will be sent to ${userEmail}. Thank you for playing!`);
            setTimeout(() => {
                resetApp();
            }, 2000);
        } else {
            // Regular discount
            alert(`Congratulations! You have a ${prize}! Redirecting to shop...`);
            setTimeout(() => {
                resetApp();
            }, 2000);
        }
    }
});

// Reset to wheel section for "Spin Again" results
function resetToWheel() {
    resultSection.classList.remove('active');
    setTimeout(() => {
        wheelSection.classList.add('active');
        // Reset wheel rotation
        wheel.style.transform = 'rotate(0deg)';
    }, 300);
}

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Ensure only email section is visible on load
    emailSection.classList.add('active');
    wheelSection.classList.remove('active');
    resultSection.classList.remove('active');
    
    // Focus on email input
    emailInput.focus();
});

// Add some visual feedback for better UX
emailInput.addEventListener('input', function() {
    const email = this.value.trim();
    if (email && isValidEmail(email)) {
        this.style.borderColor = '#4CAF50';
    } else if (email) {
        this.style.borderColor = '#ff6b6b';
    } else {
        this.style.borderColor = '#e0e0e0';
    }
});

// Prevent double submission
emailForm.addEventListener('submit', function(e) {
    if (isSpinning) {
        e.preventDefault();
        return false;
    }
});

// Add keyboard support for better accessibility
document.addEventListener('keydown', function(e) {
    // Allow Enter to spin wheel when wheel section is active
    if (e.key === 'Enter' && wheelSection.classList.contains('active') && !isSpinning) {
        spinWheel();
    }
    
    // Allow Escape to reset app
    if (e.key === 'Escape') {
        resetApp();
    }
});

// Add smooth scrolling and better mobile experience
document.addEventListener('touchstart', function() {}, {passive: true});

// Preload images and fonts for better performance
function preloadAssets() {
    // Preload Google Fonts
    const fontLinks = [
        'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap'
    ];
    
    fontLinks.forEach(link => {
        const linkElement = document.createElement('link');
        linkElement.rel = 'preload';
        linkElement.as = 'style';
        linkElement.href = link;
        document.head.appendChild(linkElement);
    });
}

// Call preload on page load
window.addEventListener('load', preloadAssets);

// Add error handling for network issues
window.addEventListener('online', function() {
    console.log('Connection restored');
});

window.addEventListener('offline', function() {
    console.log('Connection lost');
    alert('You appear to be offline. Please check your internet connection and try again.');
});
