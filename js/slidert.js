/* ============ ТАЙГА: слайдеры (сценарии + каталог) ============ */
(function () {
  'use strict';

  function initSlider(trackId, prevId, nextId, cardSelector) {
    var track = document.getElementById(trackId);
    var prev = document.getElementById(prevId);
    var next = document.getElementById(nextId);
    if (!track || !prev || !next) return null;

    function step() {
      var card = track.querySelector(cardSelector);
      return card ? card.getBoundingClientRect().width + 24 : 320;
    }
    function update() {
      prev.classList.toggle('is-disabled', track.scrollLeft <= 4);
      next.classList.toggle('is-disabled', track.scrollLeft >= track.scrollWidth - track.clientWidth - 4);
    }
    prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
    next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    return { track: track, step: step };
  }

  /* ---- Сценарии использования ---- */
  initSlider('scenarios-track', 'scenarios-prev', 'scenarios-next', '.scene-card');

  /* ---- Каталог: свайп / стрелки / колесико ---- */
  var catalog = initSlider('catalog-track', 'catalog-prev', 'catalog-next', '.product');
  if (catalog) {
    var lock = false;
    catalog.track.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      var atStart = catalog.track.scrollLeft <= 4;
      var atEnd = catalog.track.scrollLeft >= catalog.track.scrollWidth - catalog.track.clientWidth - 4;
      if (e.deltaY > 0 && !atEnd) {
        e.preventDefault();
        if (!lock) { lock = true; catalog.track.scrollBy({ left: catalog.step(), behavior: 'smooth' }); setTimeout(function () { lock = false; }, 650); }
      } else if (e.deltaY < 0 && !atStart) {
        e.preventDefault();
        if (!lock) { lock = true; catalog.track.scrollBy({ left: -catalog.step(), behavior: 'smooth' }); setTimeout(function () { lock = false; }, 650); }
      }
    }, { passive: false });
  }
})();