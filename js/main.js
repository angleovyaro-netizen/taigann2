/* ============ ТАЙГА: логика интерфейса ============ */
(function () {
  'use strict';

  /* ---- Sticky header ---- */
  var header = document.getElementById('header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 40); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- Burger menu ---- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') {
      document.body.classList.remove('menu-open');
      burger.setAttribute('aria-expanded', 'false');
    }
  });

  /* ---- Кнопки каталога -> подстановка модели в форму ---- */
  var modelSelect = document.getElementById('f-model');
  document.querySelectorAll('[data-model]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!modelSelect) return;
      var value = btn.getAttribute('data-model');
      Array.prototype.forEach.call(modelSelect.options, function (opt) {
        if (opt.text === value || opt.value === value) modelSelect.value = opt.value || opt.text;
      });
    });
  });

  /* ---- Интерактивные опции ---- */
  var optionCards = document.querySelectorAll('.option-card');
  var summary = document.getElementById('options-summary');
  var optionsInput = document.getElementById('f-options');
  function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽'; }
  function updateOptions() {
    var names = [], total = 0;
    optionCards.forEach(function (c) {
      if (c.classList.contains('is-on')) {
        names.push(c.getAttribute('data-name'));
        total += parseInt(c.getAttribute('data-price'), 10);
      }
    });
    if (summary) {
      summary.textContent = names.length
        ? 'Выбранные опции: ' + names.join(', ') + ' (+' + fmt(total) + ')'
        : 'Выбранные опции: нет';
    }
    if (optionsInput) optionsInput.value = names.length ? names.join(', ') + ' (+' + fmt(total) + ')' : '';
  }
  optionCards.forEach(function (card) {
    card.addEventListener('click', function () {
      var on = card.classList.toggle('is-on');
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
      updateOptions();
    });
  });

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq__item').forEach(function (item) {
    var q = item.querySelector('.faq__q');
    var a = item.querySelector('.faq__a');
    q.addEventListener('click', function () {
      var open = item.classList.contains('is-open');
      document.querySelectorAll('.faq__item.is-open').forEach(function (other) {
        other.classList.remove('is-open');
        other.querySelector('.faq__q').setAttribute('aria-expanded', 'false');
        other.querySelector('.faq__a').style.maxHeight = null;
      });
      if (!open) {
        item.classList.add('is-open');
        q.setAttribute('aria-expanded', 'true');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---- Форма: валидация + состояние отправки ---- */
  var form = document.getElementById('request-form');
  var submitBtn = document.getElementById('form-submit');
  var successBox = document.getElementById('form-success');

  function setError(field, message) {
    var wrap = field.closest('.form__field');
    var err = wrap.querySelector('.form__error');
    wrap.classList.add('is-invalid');
    if (err) { err.textContent = message; err.hidden = false; }
  }
  function clearErrors() {
    form.querySelectorAll('.form__field').forEach(function (w) {
      w.classList.remove('is-invalid');
      var err = w.querySelector('.form__error');
      if (err) err.hidden = true;
    });
  }
  function validName(v) { return v.trim().length >= 2; }
  function validPhone(v) {
    var digits = v.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 12 && /^[+0-9()\-\s]+$/.test(v);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    successBox.hidden = true;

    var name = document.getElementById('f-name');
    var phone = document.getElementById('f-phone');
    var ok = true;

    if (!validName(name.value)) { setError(name, 'Укажите имя (минимум 2 символа).'); ok = false; }
    if (!validPhone(phone.value)) { setError(phone, 'Укажите корректный телефон, например +7 (930) 705-87-00.'); ok = false; }
    if (!ok) return;

    /* Payload готов для подключения backend */
    var payload = {
      name: name.value.trim(),
      phone: phone.value.trim(),
      city: document.getElementById('f-city').value.trim(),
      persons: document.getElementById('f-persons').value,
      model: modelSelect.value,
      comment: document.getElementById('f-comment').value.trim(),
      options: optionsInput.value
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправляем…';

    /* TODO: подключить backend — fetch('/api/lead', {method:'POST', body: JSON.stringify(payload)}) */
    setTimeout(function () {
      console.info('Заявка (демо, backend не подключён):', payload);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Получить расчёт';
      successBox.hidden = false;
      form.reset();
      updateOptions();
    }, 900);
  });

  /* ---- Год в футере ---- */
  document.getElementById('year').textContent = new Date().getFullYear();
})();