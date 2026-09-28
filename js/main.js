/**
 * ТАЙГА — Main JavaScript
 * Vanilla JS, no dependencies
 */

(function () {
    'use strict';

    // ========================================
    // HEADER SCROLL EFFECT
    // ========================================
    const header = document.getElementById('header');
    let lastScroll = 0;

    function handleHeaderScroll() {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleHeaderScroll, { passive: true });
    handleHeaderScroll();

    // ========================================
    // MOBILE MENU
    // ========================================
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = mobileMenu.querySelectorAll('a');

    function toggleMenu() {
        const isActive = burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        burger.setAttribute('aria-expanded', isActive);
        mobileMenu.setAttribute('aria-hidden', !isActive);
        document.body.style.overflow = isActive ? 'hidden' : '';
    }

    function closeMenu() {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    burger.addEventListener('click', toggleMenu);
    mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

    // ========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========================================
    // INTERSECTION OBSERVER — FADE UP
    // ========================================
    const fadeElements = document.querySelectorAll(
        '.section__title, .offer__item, .why__card, .catalog__card, ' +
        '.materials__card, .steps__item, .faq__item, .kit__item, ' +
        '.production__text, .grill__content, .scenarios__card'
    );

    fadeElements.forEach(el => el.classList.add('fade-up'));

    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // ========================================
    // GENERIC SLIDER
    // ========================================
    function createSlider(sliderId, trackSelector, cardSelector) {
        const slider = document.getElementById(sliderId);
        if (!slider) return;

        const track = slider.querySelector(trackSelector);
        const cards = slider.querySelectorAll(cardSelector);
        const prevBtn = slider.querySelector(`[class*="prev"]`);
        const nextBtn = slider.querySelector(`[class*="next"]`);

        if (!cards.length) return;

        let currentIndex = 0;
        let cardsPerView = getCardsPerView();
        let maxIndex = Math.max(0, cards.length - cardsPerView);

        function getCardsPerView() {
            if (window.innerWidth <= 768) return 1;
            if (window.innerWidth <= 1024) return 2;
            return cards.length <= 4 ? cards.length : 4;
        }

        function updateSlider() {
            const cardWidth = cards[0].offsetWidth;
            const gap = 24;
            const offset = currentIndex * (cardWidth + gap);
            track.style.transform = `translateX(-${offset}px)`;
            track.style.transition = 'transform 0.4s ease';
        }

        function goNext() {
            if (currentIndex < maxIndex) {
                currentIndex++;
            } else {
                currentIndex = 0;
            }
            updateSlider();
        }

        function goPrev() {
            if (currentIndex > 0) {
                currentIndex--;
            } else {
                currentIndex = maxIndex;
            }
            updateSlider();
        }

        if (prevBtn) prevBtn.addEventListener('click', goPrev);
        if (nextBtn) nextBtn.addEventListener('click', goNext);

        // Touch/swipe support
        let startX = 0;
        let isDragging = false;

        track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        track.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            const endX = e.changedTouches[0].clientX;
            const diff = startX - endX;
            if (Math.abs(diff) > 50) {
                if (diff > 0) goNext();
                else goPrev();
            }
            isDragging = false;
        }, { passive: true });

        // Mouse wheel support for desktop
        slider.addEventListener('wheel', (e) => {
            if (window.innerWidth <= 768) return;
            e.preventDefault();
            if (e.deltaY > 0) goNext();
            else goPrev();
        }, { passive: false });

        // Resize handler
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                cardsPerView = getCardsPerView();
                maxIndex = Math.max(0, cards.length - cardsPerView);
                if (currentIndex > maxIndex) currentIndex = maxIndex;
                updateSlider();
            }, 200);
        });

        updateSlider();
    }

    createSlider('catalogSlider', '.catalog__track', '.catalog__card');
    createSlider('scenariosSlider', '.scenarios__track', '.scenarios__card');

    // ========================================
    // FAQ ACCORDION
    // ========================================
    const faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            });

            // Open clicked if wasn't active
            if (!isActive) {
                item.classList.add('active');
                question.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ========================================
    // FORM VALIDATION
    // ========================================
    const form = document.getElementById('requestForm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const formSuccess = document.getElementById('formSuccess');

    function validateName(value) {
        return value.trim().length >= 2;
    }

    function validatePhone(value) {
        const digits = value.replace(/\D/g, '');
        return digits.length >= 10 && digits.length <= 11;
    }

    function showError(input) {
        input.classList.add('error');
    }

    function clearError(input) {
        input.classList.remove('error');
    }

    // Phone mask
    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value[0] === '7' || value[0] === '8') {
                value = value.substring(1);
            }
            let formatted = '+7';
            if (value.length > 0) formatted += ' (' + value.substring(0, 3);
            if (value.length >= 3) formatted += ') ' + value.substring(3, 6);
            if (value.length >= 6) formatted += '-' + value.substring(6, 8);
            if (value.length >= 8) formatted += '-' + value.substring(8, 10);
            e.target.value = formatted;
        }
    });

    // Real-time validation
    nameInput.addEventListener('blur', () => {
        if (nameInput.value && !validateName(nameInput.value)) {
            showError(nameInput);
        } else {
            clearError(nameInput);
        }
    });

    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value && !validatePhone(phoneInput.value)) {
            showError(phoneInput);
        } else {
            clearError(phoneInput);
        }
    });

    nameInput.addEventListener('input', () => clearError(nameInput));
    phoneInput.addEventListener('input', () => clearError(phoneInput));

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        let isValid = true;

        if (!validateName(nameInput.value)) {
            showError(nameInput);
            isValid = false;
        }

        if (!validatePhone(phoneInput.value)) {
            showError(phoneInput);
            isValid = false;
        }

        if (!isValid) return;

        // Collect data
        const formData = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            city: document.getElementById('city').value.trim(),
            people: document.getElementById('people').value,
            model: document.getElementById('model').value,
            comment: document.getElementById('comment').value.trim(),
            timestamp: new Date().toISOString()
        };

        // Imitation of sending
        console.log('📤 Заявка отправлена:', formData);

        // Show success
        formSuccess.classList.add('active');
        form.reset();

        // Hide success after 5 seconds
        setTimeout(() => {
            formSuccess.classList.remove('active');
        }, 5000);
    });

    // ========================================
    // ESC KEY — CLOSE MOBILE MENU
    // ========================================
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
            closeMenu();
        }
    });

})();