/**
 * ТАЙГА — Main JavaScript (v2)
 * Vanilla JS, no dependencies
 * Fixed slider engine
 */

(function () {
    'use strict';

    // ========================================
    // HEADER SCROLL EFFECT
    // ========================================
    const header = document.getElementById('header');

    function handleHeaderScroll() {
        if (window.pageYOffset > 50) {
            header.classList.add('header--scrolled');
        } else {
            header.classList.remove('header--scrolled');
        }
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
    // SMOOTH SCROLL
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
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    fadeElements.forEach(el => fadeObserver.observe(el));

    // ========================================
    // UNIVERSAL SLIDER ENGINE
    // ========================================
    class Slider {
        constructor(options) {
            this.slider = document.getElementById(options.sliderId);
            if (!this.slider) return;

            this.track = this.slider.querySelector(options.trackSelector);
            this.cards = Array.from(this.slider.querySelectorAll(options.cardSelector));
            this.prevBtn = this.slider.querySelector(options.prevSelector);
            this.nextBtn = this.slider.querySelector(options.nextSelector);
            this.dotsContainer = this.slider.querySelector(options.dotsSelector);
            this.counter = this.slider.querySelector(options.counterSelector);

            this.currentIndex = 0;
            this.cardsPerView = 1;
            this.maxIndex = 0;
            this.gap = 24;
            this.isAnimating = false;
            this.autoPlayTimer = null;

            this.init();
        }

        init() {
            this.createDots();
            this.bindEvents();
            this.recalculate();
            this.render();

            // Recalculate on resize
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.recalculate();
                    this.render();
                }, 150);
            });
        }

        getCardsPerView() {
            const width = window.innerWidth;
            if (width <= 768) return 1;
            if (width <= 1024) return 2;
            return Math.min(this.cards.length, 4);
        }

        recalculate() {
            this.cardsPerView = this.getCardsPerView();
            this.maxIndex = Math.max(0, this.cards.length - this.cardsPerView);
            if (this.currentIndex > this.maxIndex) {
                this.currentIndex = this.maxIndex;
            }
        }

        createDots() {
            if (!this.dotsContainer) return;
            this.dotsContainer.innerHTML = '';
            // Количество "страниц" = maxIndex + 1
            const pagesCount = this.maxIndex + 1;
            for (let i = 0; i < pagesCount; i++) {
                const dot = document.createElement('button');
                dot.className = 'slider-dot';
                dot.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
                dot.addEventListener('click', () => this.goTo(i));
                this.dotsContainer.appendChild(dot);
            }
        }

        updateDots() {
            if (!this.dotsContainer) return;
            const dots = this.dotsContainer.querySelectorAll('.slider-dot');
            dots.forEach((dot, i) => {
                dot.classList.toggle('active', i === this.currentIndex);
            });
        }

        updateCounter() {
            if (!this.counter) return;
            this.counter.textContent = `${this.currentIndex + 1} / ${this.maxIndex + 1}`;
        }

        updateButtons() {
            if (this.prevBtn) this.prevBtn.disabled = this.currentIndex === 0;
            if (this.nextBtn) this.nextBtn.disabled = this.currentIndex === this.maxIndex;
        }

        getOffset() {
            if (!this.cards.length) return 0;
            const cardWidth = this.cards[0].offsetWidth;
            return this.currentIndex * (cardWidth + this.gap);
        }

        render() {
            const offset = this.getOffset();
            this.track.style.transform = `translateX(-${offset}px)`;
            this.updateDots();
            this.updateCounter();
            this.updateButtons();
        }

        goTo(index) {
            if (this.isAnimating) return;
            if (index < 0 || index > this.maxIndex) return;
            this.currentIndex = index;
            this.isAnimating = true;
            this.render();
            setTimeout(() => { this.isAnimating = false; }, 500);
        }

        next() {
            const nextIndex = this.currentIndex < this.maxIndex ? this.currentIndex + 1 : 0;
            this.goTo(nextIndex);
        }

        prev() {
            const prevIndex = this.currentIndex > 0 ? this.currentIndex - 1 : this.maxIndex;
            this.goTo(prevIndex);
        }

        bindEvents() {
            // Кнопки
            if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
            if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

            // Клавиатура (стрелки) — только когда слайдер в viewport
            const keyHandler = (e) => {
                if (!this.isInViewport()) return;
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            };
            document.addEventListener('keydown', keyHandler);

            // Свайп на мобильных
            let startX = 0;
            let startY = 0;
            let isDragging = false;

            this.track.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                isDragging = true;
            }, { passive: true });

            this.track.addEventListener('touchend', (e) => {
                if (!isDragging) return;
                const endX = e.changedTouches[0].clientX;
                const endY = e.changedTouches[0].clientY;
                const diffX = startX - endX;
                const diffY = startY - endY;

                // Только горизонтальный свайп
                if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
                    if (diffX > 0) this.next();
                    else this.prev();
                }
                isDragging = false;
            }, { passive: true });

            // Колёсико мыши — только когда слайдер в viewport
            let wheelTimeout;
            this.slider.addEventListener('wheel', (e) => {
                if (!this.isInViewport()) return;
                // Блокируем стандартный скролл страницы только когда курсор над слайдером
                e.preventDefault();
                clearTimeout(wheelTimeout);
                wheelTimeout = setTimeout(() => {
                    if (e.deltaY > 0) this.next();
                    else this.prev();
                }, 50);
            }, { passive: false });
        }

        isInViewport() {
            const rect = this.slider.getBoundingClientRect();
            return rect.top < window.innerHeight && rect.bottom > 0;
        }
    }

    // Инициализация слайдеров
    new Slider({
        sliderId: 'catalogSlider',
        trackSelector: '.catalog__track',
        cardSelector: '.catalog__card',
        prevSelector: '.catalog__btn--prev',
        nextSelector: '.catalog__btn--next',
        dotsSelector: '#catalogDots',
        counterSelector: '#catalogCounter'
    });

    new Slider({
        sliderId: 'scenariosSlider',
        trackSelector: '.scenarios__track',
        cardSelector: '.scenarios__card',
        prevSelector: '.scenarios__btn--prev',
        nextSelector: '.scenarios__btn--next',
        dotsSelector: '#scenariosDots',
        counterSelector: null
    });

    // ========================================
    // FAQ ACCORDION
    // ========================================
    const faqItems = document.querySelectorAll('.faq__item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq__question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            });
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

    function showError(input) { input.classList.add('error'); }
    function clearError(input) { input.classList.remove('error'); }

    // Маска телефона
    phoneInput.addEventListener('input', function (e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 0) {
            if (value[0] === '7' || value[0] === '8') value = value.substring(1);
            let formatted = '+7';
            if (value.length > 0) formatted += ' (' + value.substring(0, 3);
            if (value.length >= 3) formatted += ') ' + value.substring(3, 6);
            if (value.length >= 6) formatted += '-' + value.substring(6, 8);
            if (value.length >= 8) formatted += '-' + value.substring(8, 10);
            e.target.value = formatted;
        }
    });

    nameInput.addEventListener('blur', () => {
        if (nameInput.value && !validateName(nameInput.value)) showError(nameInput);
        else clearError(nameInput);
    });

    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value && !validatePhone(phoneInput.value)) showError(phoneInput);
        else clearError(phoneInput);
    });

    nameInput.addEventListener('input', () => clearError(nameInput));
    phoneInput.addEventListener('input', () => clearError(phoneInput));

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let isValid = true;

        if (!validateName(nameInput.value)) { showError(nameInput); isValid = false; }
        if (!validatePhone(phoneInput.value)) { showError(phoneInput); isValid = false; }
        if (!isValid) return;

        const formData = {
            name: nameInput.value.trim(),
            phone: phoneInput.value.trim(),
            city: document.getElementById('city').value.trim(),
            people: document.getElementById('people').value,
            model: document.getElementById('model').value,
            comment: document.getElementById('comment').value.trim(),
            timestamp: new Date().toISOString()
        };

        console.log('📤 Заявка отправлена:', formData);
        formSuccess.classList.add('active');
        form.reset();
        setTimeout(() => formSuccess.classList.remove('active'), 5000);
    });

    // ESC — закрыть мобильное меню
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMenu();
    });

})();