/* Core Application Logic - QR Wishes */

document.addEventListener('DOMContentLoaded', () => {
    // --- GLOBAL CONFIGS & STYLES ---
    initGlobalThemes();
    initMobileNav();
    
    // --- ROUTE SPECIFIC HANDLERS ---
    const path = window.location.pathname;
    
    if (path === '/' || path === '/index') {
        initQRScanner();
    } else if (path === '/generate') {
        initWishGenerator();
    } else if (path.startsWith('/result/')) {
        initResultUtilities();
    } else if (path.startsWith('/wish/')) {
        initBirthdayWishSurprise();
    } else if (path === '/contact') {
        initContactForm();
    }
    
    // Hide Loader
    const loader = document.getElementById('page-loader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
        }, 300);
    }
});

// --- 1. GLOBAL THEMES & SYSTEM CONTROLS ---
function initGlobalThemes() {
    const themeBtn = document.getElementById('theme-toggle');
    if (!themeBtn) return;
    
    // Check local storage preference
    const savedTheme = localStorage.getItem('theme-preference') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        themeBtn.innerHTML = '<i class="fa-solid fa-sun"></i>';
    } else {
        document.body.classList.remove('dark-mode');
        themeBtn.innerHTML = '<i class="fa-solid fa-moon"></i>';
    }
    
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme-preference', isDark ? 'dark' : 'light');
        themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun"></i>' : '<i class="fa-solid fa-moon"></i>';
        showToast(`Theme switched to ${isDark ? 'Dark' : 'Light'} Mode`, 'info');
    });
}

function initMobileNav() {
    const burgerBtn = document.getElementById('burger-btn');
    const navLinks = document.getElementById('nav-links');
    if (!burgerBtn || !navLinks) return;
    
    burgerBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        burgerBtn.classList.toggle('active');
    });
}

// --- 2. TOAST NOTIFICATIONS DISPATCHER ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'fa-check-circle';
    if (type === 'error') icon = 'fa-times-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'info') icon = 'fa-info-circle';
    
    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Trigger slide-in animation
    setTimeout(() => toast.classList.add('show'), 50);
    
    // Auto remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3800);
}

// --- 3. GENERATE SURPRISE FORM & REALTIME PREVIEW ---
function initWishGenerator() {
    const form = document.getElementById('generator-form');
    if (!form) return;
    
    // Inputs & Previews
    const friendNameInput = document.getElementById('friend-name');
    const senderNameInput = document.getElementById('sender-name');
    const bdayDateInput = document.getElementById('birthday-date');
    const ageInput = document.getElementById('age');
    const messageInput = document.getElementById('birthday-message');
    
    const previewHeading = document.getElementById('preview-heading');
    const previewAge = document.getElementById('preview-age');
    const previewMsgText = document.getElementById('preview-msg-text');
    const previewSender = document.getElementById('preview-sender');
    
    // Realtime Input Sync
    friendNameInput.addEventListener('input', (e) => {
        previewHeading.textContent = e.target.value ? `Happy Birthday, ${e.target.value}!` : 'Happy Birthday, Friend!';
    });
    senderNameInput.addEventListener('input', (e) => {
        previewSender.textContent = e.target.value ? e.target.value : 'Sarah';
    });
    ageInput.addEventListener('input', (e) => {
        if (e.target.value) {
            previewAge.textContent = `Turning ${e.target.value}`;
            previewAge.style.display = 'block';
        } else {
            previewAge.style.display = 'none';
        }
    });
    messageInput.addEventListener('input', (e) => {
        previewMsgText.textContent = e.target.value ? e.target.value : 'Your greeting message will appear here in real-time. Choose a cute theme and upload custom images to customize this card!';
        // Character counter
        const len = e.target.value.length;
        document.getElementById('char-counter').textContent = `${len} / 500 characters`;
    });
    
    // Random Birthday Quotes List
    const quotes = [
        "Wishing you a day filled with laughter, love, cake, and absolute joy. You deserve all the good things today and always! 🥳🎂",
        "Happy Birthday! Thank you for being such an incredible presence in my life. May this year be your best and brightest adventure yet! ✨🎁",
        "Cheers to another trip around the sun! May your day be as spectacular, fun-loving, and beautiful as you are. Cheers to you! 🎉🥂",
        "Happy Birthday! Sending you massive hugs and positive vibes. Eat a huge slice of cake for me, and make some beautiful wishes! 🕯️💖",
        "To a wonderful friend: May your birthday fill your heart with happiness, and may the year ahead be packed with success and smiles! 🌟🎈",
        "Happy Birthday! Life is an adventure, and this year is going to be a gorgeous milestone. Enjoy every second of your special celebration!"
    ];
    
    document.getElementById('btn-random-quote').addEventListener('click', () => {
        const randIdx = Math.floor(Math.random() * quotes.length);
        messageInput.value = quotes[randIdx];
        // Trigger manual input updates
        messageInput.dispatchEvent(new Event('input'));
        showToast("Random quote inserted!", "info");
    });
    
    // File Previews
    const friendPhotoInput = document.getElementById('friend-photo-input');
    const friendPreview = document.getElementById('friend-photo-preview');
    const friendPreviewContainer = document.getElementById('friend-photo-preview-container');
    const livePreviewPhoto = document.getElementById('preview-photo');
    
    friendPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("File size too large (Max 5MB)", "error");
                friendPhotoInput.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function(evt) {
                friendPreview.src = evt.target.result;
                friendPreviewContainer.style.display = 'flex';
                livePreviewPhoto.src = evt.target.result;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('btn-remove-photo').addEventListener('click', () => {
        friendPhotoInput.value = '';
        friendPreviewContainer.style.display = 'none';
        livePreviewPhoto.src = 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&width=200&auto=format&fit=crop';
    });
    
    const bgPhotoInput = document.getElementById('bg-photo-input');
    const bgPreview = document.getElementById('bg-photo-preview');
    const bgPreviewContainer = document.getElementById('bg-photo-preview-container');
    const liveCardPreview = document.getElementById('live-card-preview');
    
    bgPhotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showToast("File size too large (Max 5MB)", "error");
                bgPhotoInput.value = '';
                return;
            }
            const reader = new FileReader();
            reader.onload = function(evt) {
                bgPreview.src = evt.target.result;
                bgPreviewContainer.style.display = 'flex';
                liveCardPreview.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.5)), url('${evt.target.result}')`;
            };
            reader.readAsDataURL(file);
        }
    });
    
    document.getElementById('btn-remove-bg').addEventListener('click', () => {
        bgPhotoInput.value = '';
        bgPreviewContainer.style.display = 'none';
        // Reset to theme background style
        updateCardThemeBackground();
    });
    
    // Theme Card Selection
    const themeCards = document.querySelectorAll('.theme-card');
    const hiddenThemeInput = document.getElementById('selected-theme');
    const themeBadge = document.getElementById('preview-theme-badge');
    
    themeCards.forEach(card => {
        card.addEventListener('click', () => {
            themeCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const theme = card.dataset.theme;
            hiddenThemeInput.value = theme;
            
            // Update preview badge
            themeBadge.textContent = card.querySelector('span').textContent;
            
            // Update live card class
            liveCardPreview.className = `live-card theme-${theme}`;
            
            // Reset background image if none uploaded
            updateCardThemeBackground();
        });
    });
    
    function updateCardThemeBackground() {
        if (!bgPhotoInput.value) {
            liveCardPreview.style.backgroundImage = '';
        }
    }
    
    // Music Card Selection
    const musicCards = document.querySelectorAll('.music-card');
    const hiddenMusicInput = document.getElementById('selected-music');
    
    musicCards.forEach(card => {
        card.addEventListener('click', () => {
            musicCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            hiddenMusicInput.value = card.dataset.music;
        });
    });
    
    // Auto-save Fields logic
    const fieldsToSave = [
        { el: friendNameInput, key: 'save_friend_name' },
        { el: senderNameInput, key: 'save_sender_name' },
        { el: ageInput, key: 'save_age' },
        { el: bdayDateInput, key: 'save_bday_date' },
        { el: messageInput, key: 'save_message' }
    ];
    
    // Load Saved State
    fieldsToSave.forEach(field => {
        const val = localStorage.getItem(field.key);
        if (val) {
            field.el.value = val;
            field.el.dispatchEvent(new Event('input'));
        }
        field.el.addEventListener('change', () => {
            localStorage.setItem(field.key, field.el.value);
        });
    });
    
    // Submit Handler via Fetch AJAX
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Basic checks
        if (!friendNameInput.value || !senderNameInput.value || !messageInput.value) {
            showToast("Please fill in all required fields (*)", "error");
            return;
        }
        
        const generateBtn = document.getElementById('btn-generate-wish');
        const origContent = generateBtn.innerHTML;
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Designing Card...';
        
        const formData = new FormData(form);
        
        fetch('/api/generate', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                // Clear Auto-saves
                fieldsToSave.forEach(f => localStorage.removeItem(f.key));
                
                showToast("Surprise generated successfully!", "success");
                setTimeout(() => {
                    window.location.href = `/result/${data.data_string}`;
                }, 1000);
            } else {
                showToast(data.error || "Generation failed", "error");
                generateBtn.disabled = false;
                generateBtn.innerHTML = origContent;
            }
        })
        .catch(err => {
            showToast("Server communication error occurred.", "error");
            generateBtn.disabled = false;
            generateBtn.innerHTML = origContent;
            console.error(err);
        });
    });
}

// --- 4. RESULT SHARING & COPIES ---
function initResultUtilities() {
    const copyBtn = document.getElementById('btn-copy-link');
    const shareInput = document.getElementById('share-link-input');
    
    if (copyBtn && shareInput) {
        copyBtn.addEventListener('click', () => {
            shareInput.select();
            shareInput.setSelectionRange(0, 99999);
            navigator.clipboard.writeText(shareInput.value)
                .then(() => {
                    showToast("Surprise link copied to clipboard!", "success");
                    copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy';
                    }, 2000);
                })
                .catch(() => {
                    showToast("Failed to copy link. Please select and copy manually.", "error");
                });
        });
    }
    
    // Web Share API
    const shareBtn = document.getElementById('btn-share-api');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            const title = shareBtn.dataset.title;
            const text = shareBtn.dataset.text;
            const url = shareBtn.dataset.url;
            
            if (navigator.share) {
                navigator.share({ title, text, url })
                    .then(() => showToast("Shared successfully!", "success"))
                    .catch((err) => console.log('Share aborted', err));
            } else {
                // Fallback copy
                shareInput.select();
                navigator.clipboard.writeText(url);
                showToast("Web Share not supported. Link copied to clipboard instead!", "info");
            }
        });
    }
}

// --- 5. SURPRISE REVEAL & AUDIO SYNTHESIZER ---
let audioCtx = null;
let melodyPlaying = false;
let notesTimeout = [];

function initBirthdayWishSurprise() {
    const configEl = document.getElementById('wish-config');
    if (!configEl) return;
    
    const theme = configEl.dataset.theme;
    const music = configEl.dataset.music;
    const birthdayDate = configEl.dataset.date;
    
    // 1. Gift Box click handler
    const giftBoxBtn = document.getElementById('gift-box-button');
    const giftWrapper = document.getElementById('gift-wrapper');
    const cardWrapper = document.getElementById('surprise-card-wrapper');
    
    if (giftBoxBtn && giftWrapper && cardWrapper) {
        giftBoxBtn.addEventListener('click', () => {
            giftWrapper.classList.add('open');
            showToast("Surprise unlocked! 🎉", "success");
            
            // Delay card reveal to let lid animate off
            setTimeout(() => {
                giftWrapper.style.display = 'none';
                cardWrapper.classList.add('show');
                
                // Trigger fireworks and confetti effects
                startCelebrationEffects();
                
                // Auto play music if set
                if (music !== 'none') {
                    startAudioPlayback(music);
                }
            }, 600);
        });
    }
    
    // 2. Music control elements
    const floatingMusicBtn = document.getElementById('btn-floating-music');
    if (floatingMusicBtn) {
        floatingMusicBtn.addEventListener('click', () => {
            if (melodyPlaying) {
                stopAudioPlayback();
            } else {
                startAudioPlayback(music);
            }
        });
    }
    
    // 3. Countdown calculations
    if (birthdayDate) {
        calculateBirthdayCountdown(birthdayDate);
    }
}

// Web Audio API Melody Synthesizer
function startAudioPlayback(musicType) {
    if (melodyPlaying) return;
    
    // Initialize AudioContext on user interaction
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    
    melodyPlaying = true;
    const musicBtn = document.getElementById('btn-floating-music');
    if (musicBtn) musicBtn.classList.add('playing');
    
    // Play Birthday Melody loop
    playBirthdayMelodyLoop(musicType);
    showToast("Playing soundtrack synthesized live! 🎵", "info");
}

function stopAudioPlayback() {
    melodyPlaying = false;
    const musicBtn = document.getElementById('btn-floating-music');
    if (musicBtn) musicBtn.classList.remove('playing');
    
    // Clear melody timeouts
    notesTimeout.forEach(clearTimeout);
    notesTimeout = [];
    showToast("Soundtrack muted", "info");
}

// Melody frequencies mapping
const NOTES = {
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 
    'F4': 349.23, 'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 
    'A#4': 466.16, 'B4': 493.88, 'C5': 523.25, 'C#5': 554.37, 'D5': 587.33,
    'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00
};

// Happy Birthday melody sequence
// Format: [noteName, relativeDuration]
const HBD_MELODY = [
    ['C4', 0.75], ['C4', 0.25], ['D4', 1.0], ['C4', 1.0], ['F4', 1.0], ['E4', 2.0],
    ['C4', 0.75], ['C4', 0.25], ['D4', 1.0], ['C4', 1.0], ['G4', 1.0], ['F4', 2.0],
    ['C4', 0.75], ['C4', 0.25], ['C5', 1.0], ['A4', 1.0], ['F4', 1.0], ['E4', 1.0], ['D4', 2.0],
    ['A#4', 0.75], ['A#4', 0.25], ['A4', 1.0], ['F4', 1.0], ['G4', 1.0], ['F4', 2.0]
];

function playBirthdayMelodyLoop(musicType) {
    if (!melodyPlaying) return;
    
    let tempo = 500; // standard tempo speed ms
    let oscType = 'sine'; // tone oscillator
    
    if (musicType === 'instrumental') {
        tempo = 380; // upbeat synth speed
        oscType = 'triangle'; // chiptune synthesizer tone
    } else if (musicType === 'piano') {
        tempo = 650; // slow beautiful speed
        oscType = 'sine'; // warm flute/piano vibe
    }
    
    let accumulatedTime = 0;
    
    HBD_MELODY.forEach((note, idx) => {
        const noteName = note[0];
        const durationMultiplier = note[1];
        const freq = NOTES[noteName];
        const noteDuration = durationMultiplier * tempo;
        
        const notePlayTimeout = setTimeout(() => {
            if (!melodyPlaying) return;
            triggerSynthTone(freq, noteDuration, oscType);
        }, accumulatedTime);
        
        notesTimeout.push(notePlayTimeout);
        accumulatedTime += noteDuration + 30; // added gap between key hits
    });
    
    // Schedule next loop sequence
    const loopTimeout = setTimeout(() => {
        if (melodyPlaying) {
            playBirthdayMelodyLoop(musicType);
        }
    }, accumulatedTime + 1000);
    
    notesTimeout.push(loopTimeout);
}

function triggerSynthTone(frequency, durationMs, type) {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.type = type;
    osc.frequency.value = frequency;
    
    const now = audioCtx.currentTime;
    const durationSec = durationMs / 1000;
    
    // Volume Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05); // Attack
    gainNode.gain.setValueAtTime(0.3, now + durationSec - 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + durationSec); // Decay
    
    osc.start(now);
    osc.stop(now + durationSec);
}

function startCelebrationEffects() {
    // Check if animations JS module functions exist
    if (typeof startConfettiEmitter === 'function') {
        startConfettiEmitter();
    }
    if (typeof startFireworksDisplay === 'function') {
        startFireworksDisplay();
    }
}

// Birthday Ticker Clock countdown calculations
function calculateBirthdayCountdown(bdayDateStr) {
    const countdownBox = document.getElementById('celebration-countdown-box');
    const labelText = document.getElementById('countdown-label-text');
    if (!countdownBox) return;
    
    const daysEl = document.getElementById('timer-days');
    const hoursEl = document.getElementById('timer-hours');
    const minutesEl = document.getElementById('timer-minutes');
    const secondsEl = document.getElementById('timer-seconds');
    
    function updateCountdown() {
        const now = new Date();
        const bdayParsed = new Date(bdayDateStr);
        
        // Construct target birthday for the CURRENT year
        let targetBday = new Date(now.getFullYear(), bdayParsed.getMonth(), bdayParsed.getDate());
        
        // If birthday has passed this year, set target to NEXT year
        if (now > targetBday && (now.getDate() !== targetBday.getDate() || now.getMonth() !== targetBday.getMonth())) {
            targetBday.setFullYear(now.getFullYear() + 1);
        }
        
        // Check if birthday is TODAY
        const isBdayToday = now.getMonth() === bdayParsed.getMonth() && now.getDate() === bdayParsed.getDate();
        
        if (isBdayToday) {
            labelText.textContent = "🎉 It's Celebration Time! Today is the Day! 🎂";
            countdownBox.style.display = 'none'; // hide timer, full party mode
            return;
        }
        
        labelText.textContent = "Countdown to Next Birthday celebration";
        countdownBox.style.display = 'flex';
        
        const diff = targetBday - now;
        
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor((diff / (1000 * 60)) % 60);
        const s = Math.floor((diff / 1000) % 60);
        
        daysEl.textContent = String(d).padStart(2, '0');
        hoursEl.textContent = String(h).padStart(2, '0');
        minutesEl.textContent = String(m).padStart(2, '0');
        secondsEl.textContent = String(s).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}



// --- 7. CAMERA QR CODE SCANNER (Index Landing Page) ---
let html5QrScanner = null;

function initQRScanner() {
    const btnStart = document.getElementById('btn-start-scan');
    const btnStop = document.getElementById('btn-stop-scan');
    const placeholder = document.getElementById('scanner-placeholder-content');
    const readerDiv = document.getElementById('reader');
    const fileInput = document.getElementById('qr-file-input');
    
    if (!btnStart) return;
    
    btnStart.addEventListener('click', () => {
        placeholder.style.display = 'none';
        readerDiv.style.display = 'block';
        btnStart.style.display = 'none';
        btnStop.style.display = 'block';
        
        // Start scanner
        html5QrScanner = new Html5Qrcode("reader");
        html5QrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: 250 },
            (decodedText) => {
                // QR Decoded
                stopCameraScan();
                showToast("QR Code parsed! Redirecting...", "success");
                setTimeout(() => {
                    window.location.href = decodedText;
                }, 1000);
            },
            (errorMessage) => {
                // error decoding, silent
            }
        ).catch(err => {
            showToast("Camera access denied or unavailable", "error");
            console.error(err);
            stopCameraScan();
        });
    });
    
    btnStop.addEventListener('click', stopCameraScan);
    
    function stopCameraScan() {
        if (html5QrScanner) {
            html5QrScanner.stop().then(() => {
                html5QrScanner = null;
                readerDiv.style.display = 'none';
                placeholder.style.display = 'flex';
                btnStart.style.display = 'block';
                btnStop.style.display = 'none';
            }).catch(err => {
                console.error(err);
            });
        }
    }
    
    // Decode from file upload drop
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const html5QrDecoder = new Html5Qrcode("reader");
        html5QrDecoder.scanFile(file, true)
            .then(decodedText => {
                showToast("QR Code image decoded!", "success");
                setTimeout(() => {
                    window.location.href = decodedText;
                }, 1000);
            })
            .catch(err => {
                showToast("No valid QR code found in uploaded image.", "error");
                console.error(err);
            });
    });
}

// --- 8. CONTACT SUBMISSION HANDLER ---
function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const origText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Sending...';
        
        const formData = new FormData(form);
        
        fetch('/contact', {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, "success");
                form.reset();
            } else {
                showToast(data.error || "Message delivery failed.", "error");
            }
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
        })
        .catch(err => {
            showToast("Server communication error occurred.", "error");
            submitBtn.disabled = false;
            submitBtn.innerHTML = origText;
            console.error(err);
        });
    });
}
