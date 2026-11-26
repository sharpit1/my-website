// Shared widgets for paper project pages (rfpar/, segpar/)
(function () {
    'use strict';

    // Before/after slider: drag or use arrow keys to move the divider
    function initCompare(el) {
        var set = function (pct) {
            pct = Math.max(0, Math.min(100, pct));
            el.style.setProperty('--pos', pct + '%');
            el.setAttribute('aria-valuenow', Math.round(pct));
        };
        var fromEvent = function (e) {
            var r = el.getBoundingClientRect();
            set((e.clientX - r.left) / r.width * 100);
        };
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'slider');
        el.setAttribute('aria-valuemin', '0');
        el.setAttribute('aria-valuemax', '100');
        set(50);
        el.addEventListener('pointerdown', function (e) {
            el.setPointerCapture(e.pointerId);
            fromEvent(e);
        });
        el.addEventListener('pointermove', function (e) {
            if (el.hasPointerCapture(e.pointerId)) fromEvent(e);
        });
        el.addEventListener('keydown', function (e) {
            var now = parseFloat(el.style.getPropertyValue('--pos')) || 50;
            if (e.key === 'ArrowLeft') { set(now - 5); e.preventDefault(); }
            if (e.key === 'ArrowRight') { set(now + 5); e.preventDefault(); }
        });
    }

    // Carousel: one visible slide, prev/next buttons, arrow keys while focused
    function initCarousel(el) {
        var slides = el.querySelectorAll('.slide');
        var counter = el.querySelector('.counter');
        var i = 0;
        var show = function (n) {
            slides[i].classList.remove('active');
            i = (n + slides.length) % slides.length;
            slides[i].classList.add('active');
            if (counter) counter.textContent = (i + 1) + ' / ' + slides.length;
        };
        el.querySelectorAll('[data-dir]').forEach(function (b) {
            b.addEventListener('click', function () { show(i + Number(b.dataset.dir)); });
        });
        el.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') show(i - 1);
            if (e.key === 'ArrowRight') show(i + 1);
        });
        show(0);
    }

    // Toggle aria-pressed inside a button group and report the chosen value
    function pick(buttons, attr, onChange) {
        buttons.forEach(function (b) {
            b.addEventListener('click', function () {
                buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
                onChange(b.getAttribute(attr));
            });
        });
    }

    // RFPAR: MS-COCO examples under attack levels alpha = 0.01 ... 0.05
    function initAlphaExplorer(root) {
        var base = root.dataset.base;
        var count = Number(root.dataset.count);
        var thumbs = root.querySelector('.thumbs');
        var range = root.querySelector('input[type="range"]');
        var label = root.querySelector('.alpha-value');
        var clean = root.querySelector('[data-role="clean"]');
        var adv = root.querySelector('[data-role="adv"]');
        var delta = root.querySelector('[data-role="delta"]');
        var pad = function (n) { return (n < 10 ? '0' : '') + n; };
        var row = 0;
        var render = function () {
            var a = Number(range.value);
            var r = base + 'r' + pad(row) + '_c';
            clean.src = r + '00.jpg';
            adv.src = r + pad(5 + a) + '.jpg';
            delta.src = r + pad(a) + '.png';
            label.textContent = 'α = 0.0' + a;
        };
        var buttons = [];
        for (var k = 0; k < count; k++) {
            var b = document.createElement('button');
            b.type = 'button';
            b.dataset.row = k;
            b.setAttribute('aria-pressed', String(k === 0));
            b.setAttribute('aria-label', 'Example ' + (k + 1));
            var img = document.createElement('img');
            img.src = base + 'r' + pad(k) + '_c00.jpg';
            img.alt = '';
            img.loading = 'lazy';
            b.appendChild(img);
            thumbs.appendChild(b);
            buttons.push(b);
        }
        pick(buttons, 'data-row', function (v) { row = Number(v); render(); });
        range.addEventListener('input', render);
        render();
    }

    // SegPAR: compare sparse attacks on the paper's teaser examples
    function initSegExplorer(root) {
        var base = root.dataset.base;
        var sparsity = JSON.parse(root.dataset.sparsity);
        var state = { ds: 'voc', method: 'segpar' };
        var q = function (role) { return root.querySelector('[data-role="' + role + '"]'); };
        var render = function () {
            var p = base + state.ds + '_';
            var deltaExt = state.ds === 'voc' ? '.png' : '.jpg';
            q('clean-img').src = p + 'original_img.jpg';
            q('clean-pred').src = p + 'original_pred.png';
            q('gt').src = p + 'original_gt.png';
            q('adv-img').src = p + state.method + '_img.jpg';
            q('adv-pred').src = p + state.method + '_pred.png';
            q('delta').src = p + state.method + '_delta' + deltaExt;
            q('sparsity').textContent = sparsity[state.ds][state.method].toFixed(2) + '%';
        };
        pick(root.querySelectorAll('[data-ds]'), 'data-ds', function (v) { state.ds = v; render(); });
        pick(root.querySelectorAll('[data-method]'), 'data-method', function (v) { state.method = v; render(); });
        var boost = q('boost');
        boost.addEventListener('change', function () { q('delta-wrap').classList.toggle('boost', boost.checked); });
        render();
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('.compare').forEach(initCompare);
        document.querySelectorAll('.carousel').forEach(initCarousel);
        document.querySelectorAll('[data-alpha-explorer]').forEach(initAlphaExplorer);
        document.querySelectorAll('[data-seg-explorer]').forEach(initSegExplorer);
        document.querySelectorAll('[data-copy]').forEach(function (b) {
            b.addEventListener('click', function () {
                var text = document.querySelector(b.dataset.copy).textContent;
                navigator.clipboard.writeText(text).then(function () {
                    b.textContent = 'Copied';
                    setTimeout(function () { b.textContent = 'Copy'; }, 1500);
                });
            });
        });
    });
})();
