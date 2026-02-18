// ===== Audio Elements =====
const bgMusic = document.getElementById('bgMusic');
const clickSound = document.getElementById('clickSound');
const heartSound = document.getElementById('heartSound');

// ===== Button Elements =====
const heartBtn = document.getElementById('heartBtn');
const messageBtn = document.getElementById('messageBtn');
const closeBtn = document.getElementById('closeBtn');
const musicControlBtn = document.getElementById('musicControlBtn');

// ===== Carousel Elements =====
const carouselTrack = document.getElementById('carouselTrack');
const carouselIndicators = document.getElementById('carouselIndicators');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// ===== Music Player Elements =====
const musicPlayer = document.getElementById('musicPlayer');
const minimizeBtn = document.getElementById('minimizeBtn');
const minimizedIcon = document.getElementById('minimizedIcon');
const playerHeader = document.getElementById('playerHeader');
const playerProgress = document.getElementById('playerProgress');
const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl = document.getElementById('totalTime');

// ===== Other Elements =====
const hiddenMessage = document.getElementById('hiddenMessage');
const heartsContainer = document.getElementById('heartsContainer');
const progressBar = document.getElementById('progressBar');

// ===== State Variables =====
let isMusicPlaying = false;
let isPlayerMinimized = false;
let currentSlide = 0;
let totalSlides = 0;

// Drag state
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    createFloatingHearts();
    setupEventListeners();
    loadContent();
    setMusicVolume(0.4);
});

// ===== Load Content from API =====
async function loadContent() {
    try {
        const res = await fetch('/api/data');
        const data = await res.json();
        
        // Update messages
        if (data.messages) {
            const m = data.messages;
            setText('mainTitle', m.title);
            setText('mainSubtitle', m.subtitle);
            setHtml('loveMessageText', (m.loveMessage || '').replace(/\n/g, '<br>'));
            setHtml('hiddenMessageText', (m.hiddenMessage || '').replace(/\n/g, '<br>'));
            setHtml('quoteText', '"' + (m.quote || '').replace(/\n/g, '<br>') + '"');
            setText('quoteAuthor', '- ' + (m.quoteAuthor || ''));
        }
        
        // Build carousel
        if (data.images && data.images.length > 0) {
            buildCarousel(data.images);
        }
    } catch (err) {
        console.error('Failed to load content:', err);
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
}

function setHtml(id, html) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;
}

function buildCarousel(images) {
    // Build slides
    carouselTrack.innerHTML = '';
    images.forEach(img => {
        const slide = document.createElement('div');
        slide.className = 'carousel-slide';
        slide.innerHTML = `<img src="images/${img.filename}" alt="${img.alt}" loading="lazy">`;
        carouselTrack.appendChild(slide);
    });
    
    // Build indicators
    carouselIndicators.innerHTML = '';
    images.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'indicator' + (index === 0 ? ' active' : '');
        dot.addEventListener('click', () => {
            playSound(clickSound);
            goToSlide(index);
        });
        carouselIndicators.appendChild(dot);
    });
    
    totalSlides = images.length;
    currentSlide = 0;
    updateCarousel();
}

// ===== Event Listeners =====
function setupEventListeners() {
    // Music control button
    musicControlBtn.addEventListener('click', toggleMusic);
    
    // Minimize button
    minimizeBtn.addEventListener('click', toggleMinimize);
    
    // Seek on progress bar click
    playerProgress.addEventListener('click', seekMusic);
    
    // Heart button
    heartBtn.addEventListener('click', () => {
        playSound(heartSound);
        createHeartBurst();
    });
    
    // Message button
    messageBtn.addEventListener('click', () => {
        playSound(clickSound);
        showHiddenMessage();
    });
    
    // Close button
    closeBtn.addEventListener('click', () => {
        playSound(clickSound);
        hideHiddenMessage();
    });
    
    // Carousel buttons
    prevBtn.addEventListener('click', () => {
        playSound(clickSound);
        previousSlide();
    });
    
    nextBtn.addEventListener('click', () => {
        playSound(clickSound);
        nextSlide();
    });
    
    // Close message when clicking outside
    hiddenMessage.addEventListener('click', (e) => {
        if (e.target === hiddenMessage) {
            hideHiddenMessage();
        }
    });
    
    // Update progress bar and time
    if (bgMusic) {
        bgMusic.addEventListener('timeupdate', updateProgressBar);
        bgMusic.addEventListener('loadedmetadata', () => {
            totalTimeEl.textContent = formatTime(bgMusic.duration);
        });
    }
}

// ===== Music Control =====
function toggleMusic() {
    if (isMusicPlaying) {
        pauseMusic();
    } else {
        playMusic();
    }
}

function playMusic() {
    bgMusic.play().then(() => {
        isMusicPlaying = true;
        updateMusicButton();
    }).catch(err => {
        console.log('Music playback failed:', err);
    });
}

function pauseMusic() {
    bgMusic.pause();
    isMusicPlaying = false;
    updateMusicButton();
}

function setMusicVolume(volume) {
    if (bgMusic) {
        bgMusic.volume = volume;
    }
}

function updateMusicButton() {
    if (isMusicPlaying) {
        musicControlBtn.textContent = '⏸️';
    } else {
        musicControlBtn.textContent = '▶️';
    }
}

function updateProgressBar() {
    if (bgMusic.duration) {
        const progress = (bgMusic.currentTime / bgMusic.duration) * 100;
        progressBar.style.width = progress + '%';
        currentTimeEl.textContent = formatTime(bgMusic.currentTime);
    }
}

function seekMusic(e) {
    if (!bgMusic.duration) return;
    const rect = playerProgress.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;
    bgMusic.currentTime = ratio * bgMusic.duration;
}

function toggleMinimize() {
    isPlayerMinimized = !isPlayerMinimized;
    musicPlayer.classList.toggle('minimized', isPlayerMinimized);
    minimizeBtn.textContent = isPlayerMinimized ? '▲' : '▼';
}

// Click on minimized icon to expand
minimizedIcon.addEventListener('click', (e) => {
    if (!isDragging) {
        toggleMinimize();
    }
});

// ===== Draggable Player =====
function setupDrag(dragHandle) {
    // Mouse events
    dragHandle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events
    dragHandle.addEventListener('touchstart', startDragTouch, { passive: false });
    document.addEventListener('touchmove', onDragTouch, { passive: false });
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    // Don't drag if clicking buttons
    if (e.target.closest('button')) return;
    isDragging = true;
    musicPlayer.classList.add('dragging');
    const rect = musicPlayer.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    e.preventDefault();
}

function startDragTouch(e) {
    if (e.target.closest('button')) return;
    isDragging = true;
    musicPlayer.classList.add('dragging');
    const rect = musicPlayer.getBoundingClientRect();
    const touch = e.touches[0];
    dragOffsetX = touch.clientX - rect.left;
    dragOffsetY = touch.clientY - rect.top;
}

function onDrag(e) {
    if (!isDragging) return;
    movePlayer(e.clientX, e.clientY);
}

function onDragTouch(e) {
    if (!isDragging) return;
    const touch = e.touches[0];
    movePlayer(touch.clientX, touch.clientY);
    e.preventDefault();
}

function movePlayer(clientX, clientY) {
    let newLeft = clientX - dragOffsetX;
    let newTop = clientY - dragOffsetY;
    
    // Keep within viewport
    const w = musicPlayer.offsetWidth;
    const h = musicPlayer.offsetHeight;
    newLeft = Math.max(0, Math.min(window.innerWidth - w, newLeft));
    newTop = Math.max(0, Math.min(window.innerHeight - h, newTop));
    
    // Use left/top instead of right/bottom
    musicPlayer.style.right = 'auto';
    musicPlayer.style.bottom = 'auto';
    musicPlayer.style.left = newLeft + 'px';
    musicPlayer.style.top = newTop + 'px';
}

function endDrag() {
    if (isDragging) {
        isDragging = false;
        musicPlayer.classList.remove('dragging');
    }
}

// Setup drag on header and minimized icon
setupDrag(playerHeader);
setupDrag(minimizedIcon);

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
}

// ===== Carousel Control =====
function updateCarousel() {
    if (totalSlides === 0) return;
    const offset = -currentSlide * 100;
    carouselTrack.style.transform = `translateX(${offset}%)`;
    
    // Update indicators
    const dots = carouselIndicators.querySelectorAll('.indicator');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

function nextSlide() {
    if (totalSlides === 0) return;
    currentSlide = (currentSlide + 1) % totalSlides;
    updateCarousel();
}

function previousSlide() {
    if (totalSlides === 0) return;
    currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

// Auto-advance carousel every 5 seconds
setInterval(() => {
    if (!document.hidden) {
        nextSlide();
    }
}, 5000);

// ===== Sound Effects =====
function playSound(audioElement) {
    if (audioElement) {
        audioElement.currentTime = 0;
        audioElement.play().catch(err => {
            console.log('Sound playback failed:', err);
        });
    }
}

// ===== Message Modal =====
function showHiddenMessage() {
    hiddenMessage.classList.add('show');
}

function hideHiddenMessage() {
    hiddenMessage.classList.remove('show');
}

// ===== Floating Hearts Animation =====
function createFloatingHearts() {
    const heartEmojis = ['❤️', '💕', '💖', '💗', '💝', '💞'];
    const numberOfHearts = 15;
    
    for (let i = 0; i < numberOfHearts; i++) {
        setTimeout(() => {
            createFloatingHeart();
        }, i * 500);
    }
    
    // Continue creating hearts periodically
    setInterval(() => {
        createFloatingHeart();
    }, 3000);
}

function createFloatingHeart() {
    const heart = document.createElement('div');
    heart.className = 'floating-heart';
    heart.textContent = getRandomHeart();
    heart.style.left = Math.random() * 100 + '%';
    heart.style.fontSize = (Math.random() * 20 + 20) + 'px';
    
    const duration = Math.random() * 5 + 8; // 8-13 seconds
    heart.style.animationDuration = duration + 's';
    
    heartsContainer.appendChild(heart);
    
    // Remove heart after animation completes
    setTimeout(() => {
        heart.remove();
    }, duration * 1000);
}

function getRandomHeart() {
    const hearts = ['❤️', '💕', '💖', '💗', '💝', '💞', '💓', '💘'];
    return hearts[Math.floor(Math.random() * hearts.length)];
}

// ===== Heart Burst Effect =====
function createHeartBurst() {
    const numberOfHearts = 20;
    const container = document.body;
    
    for (let i = 0; i < numberOfHearts; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.textContent = '💖';
            heart.style.position = 'fixed';
            heart.style.left = '50%';
            heart.style.top = '50%';
            heart.style.fontSize = '30px';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '9999';
            heart.style.transform = 'translate(-50%, -50%)';
            
            container.appendChild(heart);
            
            // Random direction
            const angle = (Math.PI * 2 * i) / numberOfHearts;
            const velocity = 200 + Math.random() * 100;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity;
            
            // Animate
            heart.animate([
                {
                    transform: 'translate(-50%, -50%) scale(1)',
                    opacity: 1
                },
                {
                    transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 1000,
                easing: 'ease-out'
            });
            
            // Remove after animation
            setTimeout(() => {
                heart.remove();
            }, 1000);
        }, i * 30);
    }
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Add sparkle effect on mouse move =====
let lastSparkleTime = 0;
document.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkleTime > 100) {
        createSparkle(e.clientX, e.clientY);
        lastSparkleTime = now;
    }
});

function createSparkle(x, y) {
    const sparkle = document.createElement('div');
    sparkle.textContent = '✨';
    sparkle.style.position = 'fixed';
    sparkle.style.left = x + 'px';
    sparkle.style.top = y + 'px';
    sparkle.style.fontSize = '20px';
    sparkle.style.pointerEvents = 'none';
    sparkle.style.zIndex = '9999';
    sparkle.style.transform = 'translate(-50%, -50%)';
    
    document.body.appendChild(sparkle);
    
    sparkle.animate([
        {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)'
        },
        {
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0) translateY(-30px)'
        }
    ], {
        duration: 800,
        easing: 'ease-out'
    });
    
    setTimeout(() => {
        sparkle.remove();
    }, 800);
}
