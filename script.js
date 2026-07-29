// ============================================
// DOM Elements
// ============================================
const tapStart = document.getElementById('tap-start');
const tapBtn = document.getElementById('tap-btn');
const introEl = document.getElementById('intro');
const introLogo = document.getElementById('intro-logo');
const preloader = document.getElementById('preloader');
const profileSelect = document.getElementById('profile-select');
const site = document.getElementById('site');
const navAvatar = document.getElementById('nav-avatar');
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');
const navbar = document.querySelector('.navbar');
const soundToggle = document.getElementById('sound-toggle');
const envelope = document.getElementById('envelope');
const openLetterBtn = document.getElementById('open-letter');
const letterModal = document.getElementById('letter-modal');
const letterModalClose = document.getElementById('letter-modal-close');
const videoPlayBtn = document.getElementById('video-play-btn');
const videoOverlay = document.getElementById('video-overlay');
const featuredVideo = document.getElementById('featured-video');
const modal = document.getElementById('photo-modal');
const modalImage = document.getElementById('modal-image');
const modalCaption = document.getElementById('modal-caption');
const modalClose = document.getElementById('modal-close');
const tabBtns = document.querySelectorAll('.tab-btn');
const memoryCards = document.querySelectorAll('.memory-card');
const carouselBtns = document.querySelectorAll('.carousel-btn');
const statNumbers = document.querySelectorAll('.stat-number[data-count]');
const cursorGlow = document.getElementById('cursor-glow');
const heroBackLayer = document.querySelector('.hero-layer-back');
const heroParticles = document.getElementById('hero-particles');
const celebrateBtn = document.getElementById('celebrate-btn');

let soundEnabled = true;
let audioCtx = null;

// ============================================
// Web Audio: synthesized Netflix-style "ta-dum" boot sound
// (no external audio file needed, works fully offline)
// ============================================
function getAudioCtx() {
    if (!audioCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AC();
    }
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
}

function playTaDum() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioCtx();
        const now = ctx.currentTime;

        function tone(freq, start, duration, gainPeak, type = 'sine') {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, now + start);
            gain.gain.setValueAtTime(0, now + start);
            gain.gain.linearRampToValueAtTime(gainPeak, now + start + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.001, now + start + duration);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + start);
            osc.stop(now + start + duration + 0.05);
        }

        // "Ta" - low swell, then "Dum" - higher resonant hit
        tone(98, 0, 0.55, 0.22, 'sawtooth');
        tone(147, 0, 0.55, 0.12, 'sine');
        tone(196, 0.62, 0.9, 0.28, 'sawtooth');
        tone(294, 0.62, 0.9, 0.16, 'sine');
        tone(392, 0.68, 0.7, 0.1, 'triangle');
    } catch (e) {
        // Web Audio unavailable; fail silently, animation still plays
    }
}

function playClick() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioCtx();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, now);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.15);
    } catch (e) {}
}

function playChime() {
    if (!soundEnabled) return;
    try {
        const ctx = getAudioCtx();
        const now = ctx.currentTime;
        [523.25, 659.25, 783.99].forEach((f, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, now + i * 0.09);
            gain.gain.setValueAtTime(0, now + i * 0.09);
            gain.gain.linearRampToValueAtTime(0.15, now + i * 0.09 + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.5);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now + i * 0.09);
            osc.stop(now + i * 0.09 + 0.55);
        });
    } catch (e) {}
}

// ============================================
// Boot sequence: Tap to Begin -> Intro logo + sound -> Preloader -> Profile select
// ============================================
tapBtn.addEventListener('click', () => {
    getAudioCtx(); // unlock audio on user gesture
    tapStart.classList.add('hidden');

    introEl.classList.add('visible');
    requestAnimationFrame(() => {
        introLogo.classList.add('playing');
        playTaDum();
    });

    setTimeout(() => {
        introEl.classList.add('fade-out');
        preloader.classList.add('visible');
    }, 2000);

    setTimeout(() => {
        introEl.classList.remove('visible', 'fade-out');
        preloader.classList.add('hidden');
        profileSelect.classList.add('visible');
    }, 3300);
});

// ============================================
// Who's Watching profile selection
// ============================================
document.querySelectorAll('.profile').forEach(profileBtn => {
    profileBtn.addEventListener('click', () => {
        playClick();
        const avatarEl = profileBtn.querySelector('.profile-avatar');
        const chosenEmoji = avatarEl ? avatarEl.textContent.trim() : '❤️';
        if (navAvatar) navAvatar.textContent = chosenEmoji || '❤️';

        profileSelect.classList.add('zoom-out');
        setTimeout(() => {
            profileSelect.classList.remove('visible');
            site.classList.add('revealed');
            animateStats();
            document.body.style.overflow = 'auto';
            scheduleSurprise();
        }, 650);
    });
});

// ============================================
// Sound toggle
// ============================================
if (soundToggle) {
    soundToggle.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
        if (!soundEnabled) {
            document.querySelectorAll('video').forEach(v => v.muted = true);
        }
    });
}

// ============================================
// Navigation
// ============================================
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
});

document.querySelectorAll('.mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ============================================
// Smooth Scroll Function
// ============================================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
}

// ============================================
// Stats Counter Animation
// ============================================
function animateStats() {
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        const counter = setInterval(() => {
            current += step;
            if (current >= target) {
                stat.textContent = target.toLocaleString();
                clearInterval(counter);
            } else {
                stat.textContent = Math.floor(current).toLocaleString();
            }
        }, 16);
    });
}

// ============================================
// Hero Parallax (multi-layer depth)
// ============================================
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    if (heroBackLayer) {
        heroBackLayer.style.transform = `scale(1.15) translateY(${scrolled * 0.35}px)`;
    }
}, { passive: true });

// Floating particles in the hero
(function initHeroParticles() {
    if (!heroParticles) return;
    const emojis = ['❤️', '💕', '✨', '💫'];
    const count = 14;
    for (let i = 0; i < count; i++) {
        const p = document.createElement('span');
        p.className = 'floating-particle';
        p.textContent = emojis[Math.floor(Math.random() * emojis.length)];
        p.style.left = Math.random() * 100 + '%';
        const duration = 8 + Math.random() * 10;
        p.style.animationDuration = duration + 's';
        p.style.animationDelay = (Math.random() * duration) + 's';
        p.style.fontSize = (0.8 + Math.random() * 1.2) + 'rem';
        heroParticles.appendChild(p);
    }
})();

// ============================================
// Ambient cursor glow (desktop only)
// ============================================
if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top = e.clientY + 'px';
    });
}

// ============================================
// Countdown to next anniversary
// ============================================
// REPLACE: set this to your actual anniversary month/day
const ANNIVERSARY_MONTH = 7; // August
const ANNIVERSARY_DAY = 30;

function getNextAnniversary() {
    const now = new Date();
    let next = new Date(now.getFullYear(), ANNIVERSARY_MONTH - 1, ANNIVERSARY_DAY, 0, 0, 0);
    if (next < now) {
        next = new Date(now.getFullYear() + 1, ANNIVERSARY_MONTH - 1, ANNIVERSARY_DAY, 0, 0, 0);
    }
    return next;
}

function updateCountdown() {
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minsEl = document.getElementById('cd-mins');
    const secsEl = document.getElementById('cd-secs');
    if (!daysEl) return;

    const target = getNextAnniversary();
    const diff = target - new Date();

    const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diff / (1000 * 60 * 60)) % 24));
    const mins = Math.max(0, Math.floor((diff / (1000 * 60)) % 60));
    const secs = Math.max(0, Math.floor((diff / 1000) % 60));

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minsEl.textContent = String(mins).padStart(2, '0');
    secsEl.textContent = String(secs).padStart(2, '0');
}
updateCountdown();
setInterval(updateCountdown, 1000);

// ============================================
// Popular / Top 10 auto-scroll rows (dummy content, built by JS)
// ============================================
const popularItems = [
    { img: '1.jpeg', label: 'First Date Night', badge: 'REWATCHED' },
    { img: '2.jpeg', label: 'Our First Trip', badge: 'NEW' },
    { img: '3.jpeg', label: 'Anniversary One', badge: 'TOP PICK' },
    { img: '4.jpeg', label: 'Movie Marathon', badge: 'COZY' },
    { img: '5.jpeg', label: 'Beach Day', badge: 'SUNNY' },
    { img: '6.jpeg', label: 'That Surprise', badge: 'SWEET' },
    { img: '7.jpeg', label: 'Sunset Walks', badge: 'GOLDEN' },
    { img: '8.jpeg', label: 'Dinner Date', badge: 'FANCY' },
];

const top10Items = [
    { img: '9.jpeg', rank: 1 },
    { img: '10.jpeg', rank: 2 },
    { img: '11.jpeg', rank: 3 },
    { img: '12.jpeg', rank: 4 },
    { img: '13.jpeg', rank: 5 },
    { img: '14.jpeg', rank: 6 },
];

function buildAutoScrollRows() {
    const popularTrack = document.getElementById('popular-track');
    const top10Track = document.getElementById('top10-track');

    if (popularTrack) {
        const items = popularItems.map(item => `
            <div class="mini-card" title="${item.label}">
                <img src="${item.img}" alt="${item.label}" loading="lazy">
                <span class="mini-badge">${item.badge}</span>
                <span class="mini-caption">${item.label}</span>
            </div>`).join('');
        // Duplicate content so the CSS translateX(-50%) loop is seamless
        popularTrack.innerHTML = items + items;
    }

    if (top10Track) {
        const items = top10Items.map(item => `
            <div class="top10-card">
                <span class="top10-rank">${item.rank}</span>
                <div class="top10-thumb"><img src="${item.img}" alt="Top ${item.rank}" loading="lazy"></div>
            </div>`).join('');
        top10Track.innerHTML = items + items;
    }
}
buildAutoScrollRows();

// ============================================
// Love Letter — fixed envelope interaction
// Opens a full, scrollable modal so every paragraph is visible together
// (previously the letter was clipped inside the small envelope shape)
// ============================================
function openEnvelope() {
    envelope.classList.add('open');
    playClick();
    setTimeout(() => {
        letterModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 500);
}
function closeLetterModal() {
    letterModal.classList.remove('active');
    document.body.style.overflow = 'auto';
    setTimeout(() => envelope.classList.remove('open'), 300);
}

openLetterBtn.addEventListener('click', openEnvelope);
envelope.addEventListener('click', openEnvelope);
letterModalClose.addEventListener('click', closeLetterModal);
letterModal.addEventListener('click', (e) => { if (e.target === letterModal) closeLetterModal(); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && letterModal.classList.contains('active')) closeLetterModal();
});

// ============================================
// Video Player
// ============================================
videoPlayBtn.addEventListener('click', () => {
    videoOverlay.classList.add('hidden');
    featuredVideo.play();
});
featuredVideo.addEventListener('pause', () => videoOverlay.classList.remove('hidden'));
featuredVideo.addEventListener('ended', () => videoOverlay.classList.remove('hidden'));

// ============================================
// Memory Cards — hover video preview, tilt + glare, favorite, modal
// ============================================
memoryCards.forEach(card => {
    const cardInner = card.querySelector('.card-inner');
    const video = card.querySelector('video');
    const glare = card.querySelector('.card-glare');
    const favBtn = card.querySelector('.fav-btn');

    // Hover: play preview video
    card.addEventListener('mouseenter', () => {
        if (video && soundEnabled !== null) {
            video.currentTime = 0;
            video.play().catch(() => {});
        }
    });
    card.addEventListener('mouseleave', () => {
        if (video) video.pause();
        if (cardInner) cardInner.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateZ(0)';
    });

    // 3D tilt + glare tracking
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = (centerY - y) / 14;
        const rotateY = (x - centerX) / 14;
        if (cardInner) {
            cardInner.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
        }
        if (glare) {
            glare.style.setProperty('--gx', (x / rect.width) * 100 + '%');
            glare.style.setProperty('--gy', (y / rect.height) * 100 + '%');
        }
    });

    // Favorite toggle ("Add to My List")
    if (favBtn) {
        favBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            favBtn.classList.toggle('active');
            favBtn.textContent = favBtn.classList.contains('active') ? '' : '+';
        });
    }

    // Click to open full photo in modal
    card.addEventListener('click', () => {
        const img = card.querySelector('img');
        const title = card.querySelector('h4');
        modalImage.src = img.src;
        modalCaption.textContent = title ? title.textContent : '';
        modal.classList.add('active');
    });
});

modalClose.addEventListener('click', () => modal.classList.remove('active'));
modal.addEventListener('click', (e) => { if (e.target === modal) modal.classList.remove('active'); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) modal.classList.remove('active');
});

// ============================================
// Category Filter Tabs
// ============================================
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const category = btn.getAttribute('data-category');
        memoryCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            if (category === 'all' || cardCategory === category) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.5s ease';
            } else {
                card.style.display = 'none';
            }
        });
    });
});

// ============================================
// Carousel Navigation
// ============================================
carouselBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const carouselId = btn.getAttribute('data-carousel');
        const carousel = document.getElementById(carouselId);
        const scrollAmount = 270;
        if (btn.classList.contains('prev')) {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        } else {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });
});

// ============================================
// Episode Flip Cards (Timeline)
// ============================================
document.querySelectorAll('.episode-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
    card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.classList.toggle('flipped');
        }
    });
});

// ============================================
// Intersection Observer for Reveal Animations
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.episode-card, .future-card').forEach(el => revealObserver.observe(el));

// ============================================
// fadeIn keyframe (for tab filtering)
// ============================================
const styleTag = document.createElement('style');
styleTag.textContent = `@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }`;
document.head.appendChild(styleTag);

// ============================================
// Touch / Mouse Swipe for Carousels
// ============================================
document.querySelectorAll('.carousel').forEach(carousel => {
    let isDown = false, startX, scrollLeft;
    carousel.addEventListener('mousedown', (e) => {
        isDown = true; startX = e.pageX - carousel.offsetLeft; scrollLeft = carousel.scrollLeft;
    });
    carousel.addEventListener('mouseleave', () => { isDown = false; });
    carousel.addEventListener('mouseup', () => { isDown = false; });
    carousel.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].pageX - carousel.offsetLeft; scrollLeft = carousel.scrollLeft;
    });
    carousel.addEventListener('touchmove', (e) => {
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
    });
});

// ============================================
// Love Trivia — Interactive Special
// ============================================
// REPLACE: swap in your own real trivia questions & answers
const triviaQuestions = [
    { q: 'Where was our first meet?', options: ['The coffee shop downtown', 'A rooftop restaurant', 'Dost ke behen ki Shaadi', 'A friend\u2019s house party'], correct: 2 },
    { q: 'What year did we officially become "us"?', options: ['2020', '2021', '2022', '2023'], correct: 1 },
    { q: 'What\u2019s our go-to comfort movie night snack?', options: ['Popcorn', 'Ice cream', 'Chocolates', 'Pizza'], correct: 3 },
    { q: 'What is my fav comfort food?', options: ['PaniPuri', 'Pizza', 'Burger', 'Momos'], correct: 0 },
    { q: 'What is my fav thing about you?', options: ['Understanding', 'Communicative', 'Green Forest !', 'All of the above'], correct: 3 }
];

let triviaIndex = 0;
let triviaScore = 0;

const triviaQuestionWrap = document.getElementById('trivia-question-wrap');
const triviaResult = document.getElementById('trivia-result');
const triviaQuestionEl = document.getElementById('trivia-question');
const triviaOptionsEl = document.getElementById('trivia-options');
const triviaCountEl = document.getElementById('trivia-count');
const triviaProgressFill = document.getElementById('trivia-progress-fill');
const triviaScoreText = document.getElementById('trivia-score-text');
const triviaReplayBtn = document.getElementById('trivia-replay');

function renderTriviaQuestion() {
    const item = triviaQuestions[triviaIndex];
    triviaCountEl.textContent = `Question ${triviaIndex + 1} of ${triviaQuestions.length}`;
    triviaQuestionEl.textContent = item.q;
    triviaProgressFill.style.width = `${((triviaIndex) / triviaQuestions.length) * 100}%`;
    triviaOptionsEl.innerHTML = '';

    item.options.forEach((opt, i) => {
        const optBtn = document.createElement('button');
        optBtn.className = 'trivia-option';
        optBtn.textContent = opt;
        optBtn.addEventListener('click', () => handleTriviaAnswer(i, optBtn));
        triviaOptionsEl.appendChild(optBtn);
    });
}

function handleTriviaAnswer(selectedIndex, btnEl) {
    const item = triviaQuestions[triviaIndex];
    const allBtns = triviaOptionsEl.querySelectorAll('.trivia-option');
    allBtns.forEach(b => b.disabled = true);

    if (selectedIndex === item.correct) {
        btnEl.classList.add('correct');
        triviaScore++;
        playClick();
    } else {
        btnEl.classList.add('wrong');
        allBtns[item.correct].classList.add('correct');
    }

    setTimeout(() => {
        triviaIndex++;
        if (triviaIndex < triviaQuestions.length) {
            renderTriviaQuestion();
        } else {
            triviaProgressFill.style.width = '100%';
            triviaQuestionWrap.style.display = 'none';
            triviaResult.classList.remove('hidden');
            triviaScoreText.textContent = `You scored ${triviaScore} / ${triviaQuestions.length}`;
            if (triviaScore === triviaQuestions.length) { launchConfetti(); playChime(); }
        }
    }, 900);
}

if (triviaReplayBtn) {
    triviaReplayBtn.addEventListener('click', () => {
        triviaIndex = 0;
        triviaScore = 0;
        triviaResult.classList.add('hidden');
        triviaQuestionWrap.style.display = 'block';
        renderTriviaQuestion();
    });
}

if (triviaQuestionEl) renderTriviaQuestion();

// ============================================
// Surprise pop-up: "New Episode Alert" toast -> Would You Rather mini game
// Appears suddenly after a delay or once the visitor scrolls partway down
// ============================================
const surpriseToast = document.getElementById('surprise-toast');
const surpriseToastClose = document.getElementById('surprise-toast-close');
const surpriseModal = document.getElementById('surprise-modal');
const surpriseModalClose = document.getElementById('surprise-modal-close');
const surpriseGameWrap = document.getElementById('surprise-game-wrap');
const surpriseEndWrap = document.getElementById('surprise-end-wrap');
const surpriseQuestionEl = document.getElementById('surprise-question');
const surpriseOptionsEl = document.getElementById('surprise-options');
const surpriseProgressEl = document.getElementById('surprise-progress');
const surpriseCloseBtn = document.getElementById('surprise-close-btn');

const wouldYouRatherQuestions = [
    { q: 'Would you rather...', options: ['Netflix & chill at home 🛋️', 'A fancy candlelit date night 🕯️'] },
    { q: 'Would you rather...', options: ['Relive our first date again', 'Go on a brand new adventure together'] },
    { q: 'Would you rather...', options: ['I make you breakfast in bed', 'You make me breakfast in bed'] },
];
let surpriseIndex = 0;
let surpriseShown = false;

function renderSurpriseQuestion() {
    const item = wouldYouRatherQuestions[surpriseIndex];
    surpriseQuestionEl.textContent = item.q;
    surpriseProgressEl.textContent = `${surpriseIndex + 1} / ${wouldYouRatherQuestions.length}`;
    surpriseOptionsEl.innerHTML = '';
    item.options.forEach(opt => {
        const b = document.createElement('button');
        b.className = 'surprise-option';
        b.textContent = opt;
        b.addEventListener('click', () => {
            playClick();
            surpriseIndex++;
            if (surpriseIndex < wouldYouRatherQuestions.length) {
                renderSurpriseQuestion();
            } else {
                surpriseGameWrap.classList.add('hidden');
                surpriseEndWrap.classList.remove('hidden');
                launchConfetti();
                playChime();
            }
        });
        surpriseOptionsEl.appendChild(b);
    });
}

function openSurpriseModal() {
    surpriseIndex = 0;
    surpriseGameWrap.classList.remove('hidden');
    surpriseEndWrap.classList.add('hidden');
    renderSurpriseQuestion();
    surpriseModal.classList.add('active');
    hideSurpriseToast();
}
function closeSurpriseModal() {
    surpriseModal.classList.remove('active');
}
function showSurpriseToast() {
    if (surpriseShown) return;
    surpriseShown = true;
    surpriseToast.classList.add('visible');
}
function hideSurpriseToast() {
    surpriseToast.classList.remove('visible');
}

function scheduleSurprise() {
    // Suddenly appears after ~18s, or as soon as the visitor scrolls halfway — whichever comes first
    setTimeout(showSurpriseToast, 18000);
    window.addEventListener('scroll', function scrollTrigger() {
        const scrolledPast = (window.scrollY + window.innerHeight) > (document.body.scrollHeight * 0.45);
        if (scrolledPast) {
            showSurpriseToast();
            window.removeEventListener('scroll', scrollTrigger);
        }
    }, { passive: true });
}

surpriseToast.addEventListener('click', openSurpriseModal);
surpriseToastClose.addEventListener('click', (e) => { e.stopPropagation(); hideSurpriseToast(); });
surpriseModalClose.addEventListener('click', closeSurpriseModal);
surpriseCloseBtn.addEventListener('click', closeSurpriseModal);
surpriseModal.addEventListener('click', (e) => { if (e.target === surpriseModal) closeSurpriseModal(); });
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && surpriseModal.classList.contains('active')) closeSurpriseModal();
});

// ============================================
// Confetti (lightweight canvas implementation)
// ============================================
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;
let confettiParticles = [];
let confettiRunning = false;

function resizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeConfettiCanvas);
resizeConfettiCanvas();

function launchConfetti() {
    if (!confettiCtx) return;
    const colors = ['#E50914', '#FF6B9D', '#FFD700', '#FFFFFF', '#B20710'];
    const newParticles = Array.from({ length: 140 }, () => ({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * 200,
        r: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedY: 2 + Math.random() * 3,
        speedX: (Math.random() - 0.5) * 3,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 8,
        life: 0,
        maxLife: 220 + Math.random() * 60
    }));
    confettiParticles = confettiParticles.concat(newParticles);
    if (!confettiRunning) {
        confettiRunning = true;
        requestAnimationFrame(runConfetti);
    }
}

function runConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;
        p.life++;
        confettiCtx.save();
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate((p.rotation * Math.PI) / 180);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6);
        confettiCtx.restore();
    });
    confettiParticles = confettiParticles.filter(p => p.life < p.maxLife && p.y < confettiCanvas.height + 40);

    if (confettiParticles.length > 0) {
        requestAnimationFrame(runConfetti);
    } else {
        confettiRunning = false;
        confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
}

if (celebrateBtn) celebrateBtn.addEventListener('click', launchConfetti);

// ============================================
// Console Easter Egg
// ============================================
console.log('%c💕 Made with love for 5 amazing years! 💕', 'color: #E50914; font-size: 20px; font-weight: bold;');
console.log('%cHappy Anniversary! 🎉', 'color: #FFD700; font-size: 16px;');