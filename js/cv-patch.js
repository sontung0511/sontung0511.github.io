/**
 * cv-patch.js
 * Reads CV data saved by admin.html from localStorage and patches the DOM.
 * Runs automatically on page load. Falls back to hardcoded HTML if no data found.
 */
(function () {
  'use strict';

  var raw = localStorage.getItem('cv_admin_data');
  if (!raw) return;

  var d;
  try { d = JSON.parse(raw); } catch (e) { return; }

  /* ── helpers ─────────────────────────────────────────── */
  function setText(id, val) {
    if (!val && val !== 0) return;
    var el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function setAttr(id, attr, val) {
    if (!val) return;
    var el = document.getElementById(id);
    if (el) el.setAttribute(attr, val);
  }

  var p = d.personal || {};
  var a = d.about    || {};
  var s = d.skills   || {};

  /* ── Sidebar ─────────────────────────────────────────── */
  setText('cv-sidebar-name',  p.name);
  setText('cv-sidebar-title', p.title);
  setAttr('cv-linkedin-link', 'href', p.linkedin);
  setAttr('cv-github-link',   'href', p.github);
  setAttr('cv-cv-download',   'href', p.cvLink);

  /* ── Home ────────────────────────────────────────────── */
  setText('cv-home-name', p.name);
  setText('cv-home-sub1', p.title);
  setText('cv-home-sub2', p.stack);

  var ph = document.getElementById('cv-home-phone');
  if (ph && p.phone)
    ph.innerHTML = '<i class="lnr lnr-phone"></i> ' + p.phone;

  var em = document.getElementById('cv-home-email');
  if (em && p.email)
    em.innerHTML = '<i class="lnr lnr-envelope"></i> ' + p.email;

  /* ── About Me ────────────────────────────────────────── */
  setText('cv-summary',       a.summary || p.summary);
  setText('cv-about-phone',    p.phone);
  setText('cv-about-email',    p.email);
  setText('cv-about-location', p.location);
  setText('cv-about-hobbies',  p.hobbies);

  /* ── Experience ──────────────────────────────────────── */
  ['1', '2', '3'].forEach(function (n) {
    var exp = d['exp' + n];
    if (!exp) return;
    setText('cv-exp' + n + '-period',  exp.period);
    setText('cv-exp' + n + '-company', exp.company);
    setText('cv-exp' + n + '-title',   exp.title);
    setText('cv-exp' + n + '-desc',    exp.description);
  });

  /* ── Education ───────────────────────────────────────── */
  var edu = d.edu || {};
  setText('cv-edu-period', edu.period);
  setText('cv-edu-school', edu.school);
  setText('cv-edu-title',  edu.degree);
  setText('cv-edu-desc',   edu.details);

  /* ── Skills ──────────────────────────────────────────── */
  setText('cv-skill-languages',  s.languages);
  setText('cv-skill-frameworks', s.frameworks);
  setText('cv-skill-principles', s.principles);
  setText('cv-skill-databases',  s.databases);
  setText('cv-skill-devops',     s.devops);
  setText('cv-soft-skills',      s.soft);

  /* ── Knowledges tags ─────────────────────────────────── */
  var kwEl = document.getElementById('cv-knowledges');
  if (kwEl && s.knowledges) {
    kwEl.innerHTML = s.knowledges
      .split(',')
      .map(function (k) { return '<li>' + k.trim() + '</li>'; })
      .join('');
  }

  /* ── Contact ─────────────────────────────────────────── */
  setText('cv-contact-phone',    p.phone);
  setText('cv-contact-email',    p.email);
  setText('cv-contact-location', p.location);

  /* ── Portfolio ───────────────────────────────────────── */
  var grid = document.getElementById('cv-portfolio-grid');
  var projects = d.portfolio;
  if (grid && projects && projects.length) {
    var categoryMap = {
      'category_reactjs': 'NextJs',
      'category_react':   'ReactJs',
      'category_vanilla': 'TypeScript',
      'category_nodejs':  'NodeJS',
      'category_golang':  'Golang',
    };

    grid.innerHTML = projects.map(function (proj) {
      if (!proj.name) return '';
      var cats = ['category_all'];
      if (proj.category) cats.push(proj.category);
      var dataGroups = JSON.stringify(cats);

      // link type: external opens in new tab, internal uses ajax-page-load
      var linkHtml;
      if (proj.linkType === 'external') {
        linkHtml = '<a href="' + escHtml(proj.link) + '" target="_blank" title="' + escHtml(proj.name) + '"><\/a>';
      } else if (proj.link) {
        linkHtml = '<a href="' + escHtml(proj.link) + '" class="ajax-page-load" title="' + escHtml(proj.name) + '"><\/a>';
      } else {
        linkHtml = '';
      }

      var iconHtml = proj.linkType === 'external'
        ? '<i class="fa fa-link"><\/i>'
        : '<i class="far fa-file-alt"><\/i>';

      var catLabel = categoryMap[proj.category] || proj.category || '';

      // image: support data-url (uploaded) or path
      var imgSrc = proj.imageData || escHtml(proj.image || 'img/portfolio/default.png');

      return '<figure class="item standard" data-groups=\'' + dataGroups + '\'>' +
        '<div class="portfolio-item-img">' +
          '<img src="' + imgSrc + '" alt="' + escHtml(proj.name) + '" />' +
          linkHtml +
        '<\/div>' +
        iconHtml +
        '<h4 class="name">' + escHtml(proj.name) + '<\/h4>' +
        '<span class="category">' + catLabel + '<\/span>' +
        '<\/figure>';
    }).join('');

    // Re-init shuffle if loaded
    if (typeof jQuery !== 'undefined' && jQuery('#cv-portfolio-grid').shuffle) {
      jQuery('#cv-portfolio-grid').shuffle('update');
    }
  }

  function escHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /* ── Avatar ──────────────────────────────────────────── */
  var avatarImg = document.getElementById('cv-avatar-img');
  if (avatarImg) {
    if (d.avatarData) {
      avatarImg.src = d.avatarData;
    } else if (d.avatarPath) {
      avatarImg.src = d.avatarPath;
    } else if (p.avatarPath) {
      avatarImg.src = p.avatarPath;
    }
  }

  /* ── CV PDF download link ────────────────────────────── */
  var cvBtn = document.getElementById('cv-cv-download');
  if (cvBtn && d.cvData) {
    try {
      var b64 = d.cvData.split(',')[1];
      var binary = atob(b64);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      var blob = new Blob([bytes], { type: 'application/pdf' });
      cvBtn.href = URL.createObjectURL(blob);
      cvBtn.download = d.cvFileName || 'CV_TungHaSon.pdf';
    } catch (e) {
      // fallback to path if blob creation fails
    }
  }

})();

