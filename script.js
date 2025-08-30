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
    // Basic logging for production
    console.log('📧 Saving email:', email);
    
    // Check if we're running locally via file:// protocol
    if (window.location.protocol === 'file:') {
        console.log('⚠️ File protocol detected - email would be saved locally:', email);
        // Simulate a successful save for local development
        return new Promise(resolve => {
            setTimeout(() => {
                resolve({ success: true, message: 'Email saved locally (demo mode)' });
            }, 1000);
        });
    }
    
    // Always use save-email function to save to MongoDB
    const apiUrl = '/.netlify/functions/save-email';
    try {
        const requestData = {
            email: email,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            screenWidth: window.innerWidth,
            isMobile: /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
        };
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Show user confirmation
        if (result.success) {
            console.log('✅ Email saved successfully:', email);
            if (result.duplicate) {
                console.log('📧 Email was already registered');
            }
        }
        
        return result;
    } catch (error) {
        console.error('❌ Error saving email:', error);
        console.error('❌ Error details:', {
            message: error.message,
            stack: error.stack,
            url: apiUrl,
            email: email
        });
        
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
    
    // Get current rotation to maintain continuity
    const currentTransform = window.getComputedStyle(wheel).transform;
    let currentRotation = 0;
    
    if (currentTransform !== 'none') {
        const values = currentTransform.split('(')[1].split(')')[0].split(',');
        const a = values[0];
        const b = values[1];
        currentRotation = Math.round(Math.atan2(b, a) * (180/Math.PI));
    }
    
    // Calculate the final rotation
    const baseRotations = Math.floor(Math.random() * 3) + 4; // 4-6 full rotations for variety
    const randomOffset = Math.random() * 20 - 10; // Smaller randomness for better accuracy
    
    // Calculate target angle - we want the winning segment's center to align with the pointer (top)
    // The pointer is at 0 degrees (12 o'clock), so we need to rotate the wheel
    // so that the winning segment's center angle points to the top
    const targetAngle = 360 - winningSegment.centerAngle + randomOffset;
    const finalRotation = currentRotation + (baseRotations * 360) + targetAngle;
    
    // Apply rotation with better timing
    wheel.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
    wheel.style.transform = `rotate(${finalRotation}deg)`;
    
    // Wait for animation to complete
    setTimeout(() => {
        showResult(winningSegment.prize, winningSegment.type);
        isSpinning = false;
        spinButton.disabled = false;
        spinButton.textContent = 'SPIN';
        
        // Normalize rotation to prevent huge values accumulating
        const normalizedRotation = finalRotation % 360;
        wheel.style.transition = 'none';
        wheel.style.transform = `rotate(${normalizedRotation}deg)`;
        
        // Re-enable transitions after a brief moment
        setTimeout(() => {
            wheel.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
        }, 50);
    }, 4000);
}

// Show Result
function showResult(prize, type) {
    discountAmount.textContent = prize;
    userEmailDisplay.textContent = userEmail;
    
    // Update result text based on prize type
    const resultText = document.querySelector('.result-content > p');
    const resultEmailText = document.querySelector('.result-email');
    
    if (type === 'retry') {
        resultText.textContent = 'Spin the wheel again for another chance!';
        if (resultEmailText) resultEmailText.style.display = 'none';
    } else if (type === 'nothing') {
        resultText.textContent = 'Better luck next time!';
        if (resultEmailText) resultEmailText.style.display = 'none';
    } else if (type === 'gift') {
        resultText.textContent = 'Congratulations! You won a free gift!';
        if (resultEmailText) resultEmailText.style.display = 'block';
    } else {
        resultText.textContent = 'Your exclusive discount has been applied!';
        if (resultEmailText) resultEmailText.style.display = 'block';
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
    
    // Reset wheel rotation smoothly
    wheel.style.transition = 'transform 1s ease-out';
    wheel.style.transform = 'rotate(0deg)';
    
    // Reset sections
    resultSection.classList.remove('active');
    wheelSection.classList.remove('active');
    setTimeout(() => {
        emailSection.classList.add('active');
        // Restore normal transition after reset
        setTimeout(() => {
            wheel.style.transition = 'transform 4s cubic-bezier(0.23, 1, 0.32, 1)';
        }, 1000);
    }, 300);
}

// No button handler needed - buttons removed

// Function removed - no longer needed as we use resetApp() for new games

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    // Ensure only email section is visible on load
    emailSection.classList.add('active');
    wheelSection.classList.remove('active');
    resultSection.classList.remove('active');
    
    // Focus on email input (but not on mobile to prevent keyboard popup)
    if (window.innerWidth > 768) {
        emailInput.focus();
    }
    
    // Setup touch support
    addTouchSupport();
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

// Improve touch interactions for mobile
function addTouchSupport() {
    // Prevent zoom on double tap for spin button
    const spinBtn = document.getElementById('spin-button');
    if (spinBtn) {
        spinBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            if (!isSpinning) {
                spinWheel();
            }
        }, {passive: false});
    }
    
    // Prevent scrolling when touching the wheel
    const wheelElement = document.getElementById('wheel');
    if (wheelElement) {
        wheelElement.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, {passive: false});
    }
}

// Call touch support setup
addTouchSupport();

// Preload images and fonts for better performance
function preloadAssets() {
    // Preload Google Fonts
    const fontLinks = [
        'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;600;700&family=Poppins:wght@300;400;500;600;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Callingstone&display=swap'
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
