/**
 * ТАЙГА — Main JavaScript
 * Vanilla JS. Карусель на translateX + фиксированная ширина карточек.
 */
(function () {
    'use strict';

    // ========================================
    // HEADER SCROLL
    // ========================================
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('header--scrolled', window.pageYOffset > 50);
    }, { passive: true });

    // ========================================
    // MOBILE MENU
    // ========================================
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');

    function toggleMenu() {
        const active = burger.classList.toggle('active');
        mobileMenu.classList.toggle('active');
        burger.setAttribute('aria-expanded', active);
        document.body.style.overflow = active ? 'hidden' : '';
    }

    function closeMenu() {
        burger.classList.remove('active');
        mobileMenu.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }

    burger.addEventListener('click', toggleMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

    // ========================================
    // SMOOTH SCROLL
    // ========================================
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', function (e) {
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ========================================
    // FADE UP ANIMATION
    // ========================================
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section__title, .offer__item, .why__card, .catalog__card, .materials__card, .steps__item, .faq__item, .kit__item, .scenarios__card').forEach(el => {
        el.classList.add('fade-up');
        fadeObserver.observe(el);
    });

    // ========================================
    // CAROUSEL ENGINE
    // ========================================
    class Carousel {
        constructor(root) {
            this.root = root;
            this.viewport = root.querySelector('.carousel__viewport');
            this.track = root.querySelector('.carousel__track');
            this.cards = Array.from(root.querySelectorAll('.carousel__track > *'));
            this.prevBtn = root.querySelector('.carousel__btn--prev');
            this.nextBtn = root.querySelector('.carousel__btn--next');
            this.dotsWrap = root.querySelector('.carousel__dots');
            this.counter = root.querySelector('.carousel__counter');

            this.index = 0;
            this.cardWidth = 0;
            this.gap = 24;
            this.visibleCount = 0;
            this.maxIndex = 0;
            this.isAnimating = false;

            this.init();
        }

        init() {
            this.calc();
            this.buildDots();
            this.render(false);
            this.bind();

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    this.calc();
                    this.buildDots();
                    if (this.index > this.maxIndex) this.index = this.maxIndex;
                    this.render(false);
                }, 150);
            });
        }

        calc() {
            if (!this.cards.length) return;
            this.cardWidth = this.cards[0].offsetWidth;
            const viewportWidth = this.viewport.clientWidth;
            this.visibleCount = Math.floor((viewportWidth + this.gap) / (this.cardWidth + this.gap)) || 1;
            this.maxIndex = Math.max(0, this.cards.length - this.visibleCount);
        }

        buildDots() {
            if (!this.dotsWrap) return;
            this.dotsWrap.innerHTML = '';
            const pages = this.maxIndex + 1;
            for (let i = 0; i < pages; i++) {
                const dot = document.createElement('button');
                dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('aria-label', `Слайд ${i + 1}`);
                dot.addEventListener('click', () => this.goTo(i));
                this.dotsWrap.appendChild(dot);
            }
        }

        render(animate = true) {
            const offset = this.index * (this.cardWidth + this.gap);
            this.track.style.transition = animate
                ? 'transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)'
                : 'none';
            this.track.style.transform = `translateX(-${offset}px)`;

            if (this.dotsWrap) {
                this.dotsWrap.querySelectorAll('.carousel__dot').forEach((d, i) => {
                    d.classList.toggle('active', i === this.index);
                });
            }

            if (this.counter) {
                this.counter.textContent = `${this.index + 1} / ${this.maxIndex + 1}`;
            }

            if (this.prevBtn) this.prevBtn.disabled = this.index === 0;
            if (this.nextBtn) this.nextBtn.disabled = this.index === this.maxIndex;
        }

        goTo(i) {
            if (this.isAnimating) return;
            if (i < 0) i = 0;
            if (i > this.maxIndex) i = this.maxIndex;
            this.index = i;
            this.isAnimating = true;
            this.render(true);
            setTimeout(() => { this.isAnimating = false; }, 500);
        }

        next() { this.goTo(this.index < this.maxIndex ? this.index + 1 : 0); }
        prev() { this.goTo(this.index > 0 ? this.index - 1 : this.maxIndex); }

        bind() {
            if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
            if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

            // Клавиатура
            document.addEventListener('keydown', (e) => {
                if (!this.inView()) return;
                if (e.key === 'ArrowLeft') this.prev();
                if (e.key === 'ArrowRight') this.next();
            });

            // Свайп
            let sx = 0, sy = 0;
            this.track.addEventListener('touchstart', e => {
                sx = e.touches[0].clientX;
                sy = e.touches[0].clientY;
            }, { passive: true });

            this.track.addEventListener('touchend', e => {
                const dx = sx - e.changedTouches[0].clientX;
                const dy = sy - e.changedTouches[0].clientY;
                if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
                    dx > 0 ? this.next() : this.prev();
                }
            }, { passive: true });

            // Колёсико мыши — только над каруселью
            let wheelTimer;
            this.root.addEventListener('wheel', (e) => {
                if (!this.inView()) return;
                e.preventDefault();
                clearTimeout(wheelTimer);
                wheelTimer = setTimeout(() => {
                    if (e.deltaY > 0) this.next();
                    else this.prev();
                }, 50);
            }, { passive: false });
        }

        inView() {
            const r = this.root.getBoundingClientRect();
            return r.top < window.innerHeight && r.bottom > 0;
        }
    }

    // Инициализация всех каруселей
    document.querySelectorAll('[data-carousel]').forEach(root => {
        new Carousel(root);
    });

    // ========================================
    // FAQ ACCORDION
    // ========================================
    document.querySelectorAll('.faq__item').forEach(item => {
        const q = item.querySelector('.faq__question');
        q.addEventListener('click', () => {
            const active = item.classList.contains('active');
            document.querySelectorAll('.faq__item').forEach(i => {
                i.classList.remove('active');
                i.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
            });
            if (!active) {
                item.classList.add('active');
                q.setAttribute('aria-expanded', 'true');
            }
        });
    });

    // ========================================
    // FORM
    // ========================================
    const form = document.getElementById('requestForm');
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const formSuccess = document.getElementById('formSuccess');

    phoneInput.addEventListener('input', function (e) {
        let v = e.target.value.replace(/\D/g, '');
        if (v.length > 0) {
            if (v[0] === '7' || v[0] === '8') v = v.substring(1);
            let f = '+7';
            if (v.length > 0) f += ' (' + v.substring(0, 3);
            if (v.length >= 3) f += ') ' + v.substring(3, 6);
            if (v.length >= 6) f += '-' + v.substring(6, 8);
            if (v.length >= 8) f += '-' + v.substring(8, 10);
            e.target.value = f;
        }
    });

    nameInput.addEventListener('blur', () => {
        if (nameInput.value && nameInput.value.trim().length < 2) nameInput.classList.add('error');
        else nameInput.classList.remove('error');
    });

    phoneInput.addEventListener('blur', () => {
        if (phoneInput.value && phoneInput.value.replace(/\D/g, '').length < 11) phoneInput.classList.add('error');
        else phoneInput.classList.remove('error');
    });

    nameInput.addEventListener('input', () => nameInput.classList.remove('error'));
    phoneInput.addEventListener('input', () => phoneInput.classList.remove('error'));

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        let ok = true;
        if (nameInput.value.trim().length < 2) { nameInput.classList.add('error'); ok = false; }
        if (phoneInput.value.replace(/\D/g, '').length < 11) { phoneInput.classList.add('error'); ok = false; }
        if (!ok) return;

        console.log('📤 Заявка:', {
            name: nameInput.value,
            phone: phoneInput.value,
            city: document.getElementById('city').value,
            people: document.getElementById('people').value,
            model: document.getElementById('model').value,
            comment: document.getElementById('comment').value
        });

        formSuccess.classList.add('active');
        form.reset();
        setTimeout(() => formSuccess.classList.remove('active'), 5000);
    });

    // ... (здесь идет весь предыдущий код: форма, аккордеон и т.д.)

    // ESC — закрыть мобильное меню
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mobileMenu.classList.contains('active')) closeMenu();
    });

    // ========================================
    // LAZY LOAD MAP (по клику)
    // ========================================
    const mapPlaceholder = document.getElementById('mapPlaceholder');
    const mapContainer = document.getElementById('mapContainer');
    const loadMapBtn = document.getElementById('loadMapBtn');

    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', function () {
            const iframe = document.createElement('iframe');
            iframe.src = 'https://yandex.ru/map-widget/v1/?ll=43.4731%2C56.5133&z=14&pt=43.4731%2C56.5133%2Cpm2rdm';
            iframe.width = '100%';
            iframe.height = '400';
            iframe.frameBorder = '0';
            iframe.allowFullscreen = true;
            iframe.loading = 'lazy';
            iframe.title = 'Карта расположения цеха Тайга в Чкаловске';
            iframe.style.cssText = 'display: block; filter: grayscale(30%) contrast(1.1);';
            
            mapPlaceholder.replaceWith(iframe);
        });
    }

})(); // <--- ЭТО САМЫЕ ПОСЛЕДНИЕ СИМВОЛЫ В ФАЙЛЕ