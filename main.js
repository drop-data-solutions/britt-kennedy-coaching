(function () {
  // Contact form: paste Britt's Web3Forms access key here to switch the form to online submission.
  // Leave it empty and the form opens a prefilled email to Britt instead.
  var WEB3FORMS_KEY = '';
  var FALLBACK_EMAIL = 'brittanykennedy011@gmail.com';

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  var select = document.getElementById('interest');
  function setInterest(v) {
    if (!select || !v) return;
    for (var i = 0; i < select.options.length; i++) {
      if (select.options[i].value === v) { select.value = v; return; }
    }
  }
  // Preselect from ?interest=... on load
  setInterest(new URLSearchParams(location.search).get('interest'));
  // Same-page clicks: preselect without reloading
  document.querySelectorAll('a[data-interest]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      setInterest(a.getAttribute('data-interest'));
      history.replaceState(null, '', '?interest=' + a.getAttribute('data-interest') + '#contact');
      document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // Hide sticky mobile button while the contact section is visible
  var sticky = document.querySelector('.sticky-cta');
  var contact = document.getElementById('contact');
  if (sticky && contact && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      sticky.classList.toggle('is-hidden', es[0].isIntersecting);
    }, { threshold: 0.1 }).observe(contact);
  }

  // Gallery videos: play only while on screen; keep native controls for reduced motion
  var vids = document.querySelectorAll('.gallery-video video');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (vids.length && !reduce && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting && !v.dataset.userPaused) {
          var p = v.play(); if (p && p.catch) p.catch(function () {});
        } else if (!e.isIntersecting) { v.pause(); }
      });
    }, { threshold: 0.5 });
    vids.forEach(function (v) {
      v.removeAttribute('controls');
      v.muted = true;
      v.setAttribute('tabindex', '0');
      function toggle() {
        if (v.paused) { delete v.dataset.userPaused; var p = v.play(); if (p && p.catch) p.catch(function () {}); }
        else { v.dataset.userPaused = '1'; v.pause(); }
      }
      v.addEventListener('click', toggle);
      v.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); }
      });
      vio.observe(v);
    });
  }

  // Reviews: hidden until testimonials.json has at least one valid entry (textContent only, never innerHTML)
  var reviews = document.getElementById('testimonials');
  var reviewsList = document.getElementById('reviews-list');
  if (reviews && reviewsList && window.fetch) {
    fetch('testimonials.json', { cache: 'no-cache' })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) {
        if (!Array.isArray(data)) return;
        var items = data.filter(function (t) {
          return t && typeof t.quote === 'string' && t.quote.trim() &&
                 typeof t.name === 'string' && t.name.trim();
        });
        if (!items.length) return;
        items.forEach(function (t) {
          var fig = document.createElement('figure');
          fig.className = 'review-card';
          var q = document.createElement('blockquote');
          var p = document.createElement('p');
          p.textContent = t.quote.trim();
          q.appendChild(p);
          var cap = document.createElement('figcaption');
          var n = document.createElement('span');
          n.className = 'review-name';
          n.textContent = t.name.trim();
          cap.appendChild(n);
          if (typeof t.service === 'string' && t.service.trim()) {
            var tag = document.createElement('span');
            tag.className = 'review-tag';
            tag.textContent = t.service.trim();
            cap.appendChild(tag);
          }
          fig.appendChild(q);
          fig.appendChild(cap);
          reviewsList.appendChild(fig);
        });
        reviews.hidden = false;
        document.querySelectorAll('[data-reviews-link]').forEach(function (a) { a.hidden = false; });
      })
      .catch(function () { /* stay hidden */ });
  }

  // Submit: Web3Forms when a key is set, otherwise a prefilled email to Britt
  var form = document.getElementById('contact-form');
  var status = document.getElementById('form-status');
  var thanks = document.getElementById('thanks');
  var fallbackNote = document.getElementById('form-fallback');
  if (!form) return;
  var useWeb3 = /^[0-9a-f-]{36}$/i.test(WEB3FORMS_KEY);
  if (useWeb3) { form.elements.access_key.value = WEB3FORMS_KEY; }
  else if (fallbackNote) { fallbackNote.hidden = false; }

  function field(n) { var el = form.elements[n]; return el ? (el.value || '').trim() : ''; }
  function mailtoHref() {
    var sel = form.elements.interest;
    var interest = sel && sel.selectedIndex > 0 ? sel.options[sel.selectedIndex].text : '';
    var lines = [
      'Name: ' + field('name'),
      'Email: ' + field('email'),
      'Phone: ' + field('phone'),
      "I'm interested in: " + interest,
      'Member at Big North Barbell: ' + field('member'),
      '',
      field('message')
    ];
    return 'mailto:' + FALLBACK_EMAIL + '?subject=' + encodeURIComponent('Free consult request') +
      '&body=' + encodeURIComponent(lines.join('\n'));
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    if (!useWeb3) {
      form.setAttribute('data-mailto', mailtoHref());
      window.location.href = form.getAttribute('data-mailto');
      status.classList.add('is-info');
      status.textContent = 'Your email app should open with your request ready to send. If it doesn\'t, call or text Britt at (989) 525-6503.';
      return;
    }
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true; status.textContent = 'Sending...';
    fetch(form.action, { method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.success) { form.hidden = true; thanks.hidden = false; thanks.focus(); }
        else { throw new Error(d.message || 'error'); }
      })
      .catch(function () {
        status.textContent = 'Sorry, something went wrong. Please call or text Britt at (989) 525-6503.';
        btn.disabled = false;
      });
  });
})();
