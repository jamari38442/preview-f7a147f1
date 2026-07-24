/* First Option K9 — interactions & animation */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky nav state ---------- */
  var nav = document.querySelector(".nav");
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- mobile menu ---------- */
  var body = document.body;
  var burger = document.querySelector(".hamburger");
  if (burger) {
    burger.addEventListener("click", function () {
      body.classList.toggle("nav-open");
    });
    document.querySelectorAll(".mobile-menu a").forEach(function (a) {
      a.addEventListener("click", function () { body.classList.remove("nav-open"); });
    });
  }

  /* ---------- scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal, [data-stagger]");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        if (el.hasAttribute("data-stagger")) {
          var kids = el.children, base = 60;
          for (var i = 0; i < kids.length; i++) {
            kids[i].style.transitionDelay = (i * base) + "ms";
          }
        }
        el.classList.add("in");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- count up (real numbers only) ---------- */
  var counted = false;
  var countEls = document.querySelectorAll("[data-count]");
  function runCount() {
    if (counted || !countEls.length) return;
    var bar = countEls[0].closest(".statbar");
    if (!bar) return;
    var r = bar.getBoundingClientRect();
    if (r.top > window.innerHeight * 0.9) return;
    counted = true;
    countEls.forEach(function (el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var suffix = el.getAttribute("data-suffix") || "";
      if (reduce) { el.textContent = target + suffix; return; }
      var start = null, dur = 1300;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  runCount();
  window.addEventListener("scroll", runCount, { passive: true });

  /* ---------- forms: fake success state ---------- */
  document.querySelectorAll("form[data-demo]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var wrap = form.closest("[data-formwrap]") || form;
      wrap.classList.add("is-sent");
      if (wrap.scrollIntoView) wrap.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    });
  });

  /* ---------- interactive checklist (localStorage) ---------- */
  document.querySelectorAll("[data-checklist]").forEach(function (root) {
    var key = "fok9_" + root.getAttribute("data-checklist");
    var boxes = root.querySelectorAll('input[type="checkbox"]');
    var fill = root.querySelector(".progress__fill");
    var label = root.querySelector(".progress__label");
    var reset = root.querySelector(".btn--reset");
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) {}

    function update(save) {
      var done = 0;
      boxes.forEach(function (b) { if (b.checked) done++; });
      var pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
      if (fill) fill.style.width = pct + "%";
      if (label) label.textContent = done + " of " + boxes.length + " complete (" + pct + "%)";
      if (save) {
        var state = {};
        boxes.forEach(function (b) { state[b.id] = b.checked; });
        try { localStorage.setItem(key, JSON.stringify(state)); } catch (e) {}
      }
    }
    boxes.forEach(function (b) {
      if (saved[b.id]) b.checked = true;
      b.addEventListener("change", function () { update(true); });
    });
    if (reset) reset.addEventListener("click", function () {
      boxes.forEach(function (b) { b.checked = false; });
      try { localStorage.removeItem(key); } catch (e) {}
      update(false);
    });
    update(false);
  });

  /* ---------- year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
