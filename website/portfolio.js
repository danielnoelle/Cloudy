/* ============================================================
   portfolio.js — shared script for all pages
   Dark mode = default (no attribute). Light mode = data-theme="light".
   ============================================================ */

/* 1. Theme Toggle
   ------------------------------------------------------------ */
(function () {
  const toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  function applyTheme(t) {
    if (t === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('theme', t); } catch (e) { /* private browsing */ }
    toggle.setAttribute(
      'aria-label',
      t === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
    );
  }

  toggle.addEventListener('click', function () {
    var current = document.documentElement.hasAttribute('data-theme') ? 'light' : 'dark';
    applyTheme(current === 'light' ? 'dark' : 'light');
  });

  // Sync with initial state set by the inline <head> script
  var initial = document.documentElement.hasAttribute('data-theme') ? 'light' : 'dark';
  applyTheme(initial);
})();

/* 2. Mobile Menu Toggle
   ------------------------------------------------------------ */
(function () {
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');
  if (!menuBtn || !navLinks) return;

  var hamburgerIcon =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
    '<path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  var closeIcon =
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
    '<path d="M18 6L6 18M6 6l12 12"/></svg>';

  menuBtn.addEventListener('click', function () {
    navLinks.classList.toggle('open');
    var isOpen = navLinks.classList.contains('open');
    menuBtn.setAttribute('aria-expanded', isOpen);
    menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    document.querySelector('header').classList.toggle('menu-open', isOpen);
    menuBtn.innerHTML = isOpen ? closeIcon : hamburgerIcon;
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && navLinks.classList.contains('open')) {
      menuBtn.click();
      menuBtn.focus();
    }
  });

  // Close menu when clicking a nav link
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      navLinks.classList.remove('open');
      menuBtn.setAttribute('aria-expanded', false);
      menuBtn.setAttribute('aria-label', 'Open menu');
      document.querySelector('header').classList.remove('menu-open');
      menuBtn.innerHTML = hamburgerIcon;
    });
  });
})();

/* Showcase category selection with roving keyboard focus. */
(function () {
  var categories = document.querySelector('.selected-showcase-tabs');
  if (!categories) return;
  var tabs = Array.from(categories.querySelectorAll('[role="tab"]'));
  var panels = categories.closest('.selected-showcase').querySelectorAll('[data-showcase-panel]');
  function select(tab, focus) {
    tabs.forEach(function (button) {
      var active = button === tab;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
    });
    panels.forEach(function (panel) {
      var active = panel.id === tab.getAttribute('aria-controls');
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    if (focus) tab.focus();
  }
  categories.addEventListener('click', function (event) {
    var tab = event.target.closest('[role="tab"]');
    if (tab && categories.contains(tab)) select(tab, true);
  });
  categories.addEventListener('keydown', function (event) {
    var index = tabs.indexOf(event.target);
    if (index < 0) return;
    if (event.key === 'ArrowRight') index = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') index = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') index = 0;
    else if (event.key === 'End') index = tabs.length - 1;
    else return;
    event.preventDefault();
    select(tabs[index], true);
  });
})();

/* Selected work detail gallery overlay. */
(function () {
  var modal = document.getElementById('showcaseModal');
  if (!modal) return;
  var title = document.getElementById('showcaseModalTitle');
  var description = document.getElementById('showcaseModalDescription');
  var skills = document.getElementById('showcaseModalSkills');
  var gallery = document.getElementById('showcaseModalGallery');
  var closeButton = modal.querySelector('.showcase-modal-close');
  var slideImage = document.getElementById('showcaseSlideImage');
  var slideDots = document.getElementById('showcaseSlideDots');
  var slideCount = document.getElementById('showcaseSlideCount');
  var dialog = modal.querySelector('.showcase-modal-dialog');
  var controls = modal.querySelector('.showcase-slider-controls');
  var slideAnimation = null;
  var slideRequest = 0;
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var activeProject = null;
  var slideIndex = 0;
  var lastTrigger = null;
  var projects = {
    synaptic: {
      title: 'Synaptic | Academics Managing App',
      description: 'For our finals project, our professor challenged us to design a mobile app prototype with strong UI/UX, visual appeal, and real purpose for students. I created Synaptic, an academic hub for managing schedules, deadlines, grades, and notes in one clean space, replacing scattered apps and planners. I independently handled research, wireframing, and high-fidelity design in Figma, aiming for a calm, intuitive experience that reduces academic stress rather than adds to it.',
      skills: ['UI/UX Prototyping', 'Figma', 'Mobile App Design'],
      images: [
        { src: 'assets/danii/projects/synaptic-overview.png', alt: 'Synaptic academic planner onboarding, dashboard, and notes screens' },
        { src: 'assets/danii/projects/synaptic-system.png', alt: 'Synaptic complete mobile app wireframes and interface system' }
      ]
    },
    insurevis: {
      title: 'Insurevis | CNN-Based Mobile App',
      description: 'For our undergraduate thesis, we proposed a solution to automate manual car damage assessment using a smartphone camera. We created InsureVis, a visual mobile application designed to seamlessly handle real-time damage detection and repair cost estimation. I initially crafted the UI/UX prototype to ensure an intuitive experience, and then transitioned into front-end development using Flutter, building a responsive interface that successfully brought our complex image capture workflows to life.',
      skills: ['Mobile App Development', 'Mobile App Design', 'Flutter'],
      images: [
        { src: 'assets/danii/projects/insurevis-overview.png', alt: 'Insurevis mobile app onboarding, sign-in, and image dashboard screens' },
        { src: 'assets/danii/projects/insurevis-system.png', alt: 'Insurevis complete mobile app interface and inspection workflow' }
      ]
    },
    "email-triage": {
      "title": "AI Email Triage",
      "description": "Managing an inbox gets harder when urgent requests, meetings, and routine updates all arrive together. This n8n workflow sorts incoming Gmail messages using keyword rules first and Gemini classification when needed. It routes each message to the right category, prepares draft replies for urgent, meeting, and vendor emails, applies labels, and keeps a decision log in Airtable. Slack alerts bring time-sensitive messages to attention while replies stay in draft for review.",
      "skills": [
        "n8n",
        "Gmail",
        "Gemini AI",
        "Slack",
        "Airtable"
      ],
      "images": [
        {
          "src": "assets/danii/projects/n8n1.png",
          "alt": "Gmail triage workflow with keyword and AI classification, category routing, reply drafts, and Airtable logging"
        }
      ]
    },
    "certificate-delivery": {
      "title": "Automated Certificate Delivery",
      "description": "Sending certificates manually means cross-checking attendance, finding the right file, and tracking who has already received it. This workflow connects Google Sheets, Drive, Gmail, and Slack to handle those steps in one process. It matches registration and attendance records, checks for the corresponding certificate, emails the file, and marks the record as processed. Missing certificates and processing errors are routed to Slack, making exceptions easier to spot without repeating the entire task.",
      "skills": [
        "n8n",
        "Google Sheets",
        "Google Drive",
        "Gmail",
        "Slack"
      ],
      "images": [
        {
          "src": "assets/danii/projects/n8n2.png",
          "alt": "Certificate delivery workflow connecting attendance sheets, Google Drive, Gmail, and Slack notifications"
        }
      ]
    },
    "notion-hub": {
      "title": "Wel\u2019s Hub | Student Dashboard",
      "description": "Course notes, deadlines, and daily tasks are easier to manage when they share one home. Wel\u2019s Hub brings course pages, a quick to-do list, and an urgent-task database into a single Notion dashboard. An embedded Pomodoro timer and clock support focused study sessions, while shortcuts keep frequently used tools close at hand. The layout pairs a dark workspace with soft purple accents and illustrated course covers, creating a study space that feels organized and personal.",
      "skills": [
        "Notion",
        "Dashboard Design",
        "Task Management"
      ],
      "images": [
        {
          "src": "assets/danii/projects/notion1.png",
          "alt": "Notion student dashboard with course cards, urgent tasks, a to-do list, and a Pomodoro timer"
        }
      ]
    },
    "coach": {"title": "Coach handbag image", "imageOnly": true, "images": [{"src": "assets/danii/projects/coach-bag.png", "alt": "Coach handbag image"}]},
    "airpods": {"title": "AirPods Pro image", "imageOnly": true, "images": [{"src": "assets/danii/projects/airpods.png", "alt": "AirPods Pro image"}]},
    "apple-watch": {"title": "Apple Watch image", "imageOnly": true, "images": [{"src": "assets/danii/projects/apple-watch.png", "alt": "Apple Watch image"}]},
    "oneplus": {"title": "OnePlus image", "imageOnly": true, "images": [{"src": "assets/danii/projects/oneplus.jpg", "alt": "OnePlus image"}]}
  };
  function cancelSlideAnimation() {
    if (slideAnimation) slideAnimation.cancel();
    slideAnimation = null;
  }
  async function showSlide(index, immediate) {
    if (!activeProject) return;
    var previousIndex = slideIndex;
    slideIndex = (index + activeProject.images.length) % activeProject.images.length;
    var image = activeProject.images[slideIndex];
    var request = ++slideRequest;
    var direction = index < previousIndex ? -1 : 1;
    cancelSlideAnimation();
    function render() {
      slideImage.src = image.src;
      slideImage.alt = image.alt;
      slideCount.textContent = (slideIndex + 1) + ' / ' + activeProject.images.length;
      slideDots.querySelectorAll('button').forEach(function (dot, i) {
        dot.setAttribute('aria-pressed', String(i === slideIndex));
      });
    }
    if (immediate || reducedMotion.matches || !slideImage.animate || previousIndex === slideIndex) {
      render();
      return;
    }
    // Decode before fading so a slow image never leaves the gallery blank.
    var preload = new Image();
    preload.src = image.src;
    if (preload.decode) {
      try { await preload.decode(); } catch (error) { /* Allow normal image loading as a fallback. */ }
    }
    if (request !== slideRequest) return;
    slideAnimation = slideImage.animate([
      { opacity: 1, transform: 'translateX(0)' },
      { opacity: 0, transform: 'translateX(' + (-direction * 10) + 'px)' }
    ], { duration: 130, easing: 'ease-out', fill: 'forwards' });
    try { await slideAnimation.finished; } catch (error) { return; }
    if (request !== slideRequest) return;
    render();
    cancelSlideAnimation();
    slideAnimation = slideImage.animate([
      { opacity: 0, transform: 'translateX(' + (direction * 10) + 'px)' },
      { opacity: 1, transform: 'translateX(0)' }
    ], { duration: 220, easing: 'ease-out' });
    slideAnimation.finished.catch(function () {});
  }
  gallery.addEventListener('click', function (event) {
    var step = event.target.closest('[data-slide-step]');
    var dot = event.target.closest('[data-slide-index]');
    if (step) showSlide(slideIndex + Number(step.getAttribute('data-slide-step')));
    if (dot) showSlide(Number(dot.getAttribute('data-slide-index')));
  });
  function open(name, trigger) {
    var project = projects[name];
    if (!project) return;
    lastTrigger = trigger;
    var imageOnly = Boolean(project.imageOnly);
    modal.classList.toggle('is-image-only', imageOnly);
    dialog.setAttribute('aria-label', project.title);
    if (imageOnly) {
      dialog.removeAttribute('aria-labelledby');
      dialog.removeAttribute('aria-describedby');
    } else {
      dialog.setAttribute('aria-labelledby', 'showcaseModalTitle');
      dialog.setAttribute('aria-describedby', 'showcaseModalDescription');
    }
    title.textContent = imageOnly ? '' : project.title;
    description.textContent = project.description || '';
    skills.innerHTML = (project.skills || []).map(function (skill) { return '<span>' + skill + '</span>'; }).join('');
    controls.hidden = project.images.length < 2;
    gallery.setAttribute('aria-label', imageOnly ? 'Image preview' : 'Project image gallery');
    activeProject = project;
    slideDots.innerHTML = project.images.map(function (image, index) {
      return '<button type="button" data-slide-index="' + index + '" aria-label="Show project image ' + (index + 1) + '" aria-pressed="false"></button>';
    }).join('');
    showSlide(0, true);
    modal.hidden = false;
    modal.querySelector('.showcase-modal-content').scrollTop = 0;
    document.body.classList.add('modal-open');
    closeButton.focus();
  }
  function close() {
    if (modal.hidden) return;
    ++slideRequest;
    cancelSlideAnimation();
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    if (lastTrigger) lastTrigger.focus();
  }
  document.addEventListener('click', function (event) {
    var trigger = event.target.closest('[data-gallery-project]');
    if (trigger) { open(trigger.getAttribute('data-gallery-project'), trigger); return; }
    if (event.target.closest('[data-gallery-close]')) close();
  });
  document.addEventListener('keydown', function (event) {
    if (modal.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      showSlide(slideIndex + (event.key === 'ArrowRight' ? 1 : -1));
    }
    if (event.key === 'Tab') {
      var buttons = Array.from(dialog.querySelectorAll('button:not([disabled])')).filter(function (button) {
        return button.getClientRects().length > 0;
      });
      var first = buttons[0];
      var last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();

/* 3. Scroll Reveal (IntersectionObserver)
   ------------------------------------------------------------ */
(function () {
  var targets = document.querySelectorAll('.reveal, .page-hero > .wrap, .about-layout, .about-tools, .contact-layout, .work-experience, .work-bottom, .more-work-section, footer');
  if (!targets.length) return;
  targets.forEach(function (el) { el.classList.add('reveal', 'pending'); });
  var reveals = document.querySelectorAll('.reveal');

  // Respect prefers-reduced-motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(function (el) { el.classList.add('visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -36px 0px' });

  reveals.forEach(function (el) { observer.observe(el); });
})();

/* 4. VS Code Typing Animation (index.html only)
   ------------------------------------------------------------ */
(function () {
  var container = document.getElementById('vscodeContent');
  if (!container) return;

  var codeText =
    'const daniel = {\n' +
    '  name: "Daniel Noel Guillen",\n' +
    '  focus: "AI, Automation & Creatives",\n' +
    '  location: "Iloilo, Philippines",\n' +
    '\n' +
    '  skills: [\n' +
    '    "Python", "JavaScript",\n' +
    '    "n8n", "Figma",\n' +
    '    "Terraform", "GitLab CI/CD"\n' +
    '  ],\n' +
    '\n' +
    '  education: {\n' +
    '    degree: "BS Information Technology",\n' +
    '    focus: "Network & Information Security"\n' +
    '  },\n' +
    '\n' +
    '  build: function() {\n' +
    '    return this.skills.map(s =>\n' +
    '      ship(s, { quality: "high" })\n' +
    '    );\n' +
    '  }\n' +
    '};';

  /**
   * Apply syntax highlighting to a single line of code.
   * Returns an HTML string with <span class="hl-*"> wrappers.
   */
  function highlightLine(text) {
    var escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return escaped.replace(/("[^"\n]*"|\b(?:const|let|var|function|return|this|new|if|else|for|while|import|export|from|class|extends)\b|\b(?:map|ship|require|console|log)\b(?=\s*\()|\b\d+(?:\.\d+)?\b|[{}()[\]]|=>)/g, function(token) {
      if (token.charAt(0) === '"') return '<span class="hl-string">' + token + '</span>';
      if (/^(const|let|var|function|return|this|new|if|else|for|while|import|export|from|class|extends)$/.test(token)) return '<span class="hl-keyword">' + token + '</span>';
      if (/^(map|ship|require|console|log)$/.test(token)) return '<span class="hl-function">' + token + '</span>';
      if (/^\d/.test(token)) return '<span class="hl-number">' + token + '</span>';
      if (token === '=>') return '<span class="hl-keyword">=&gt;</span>';
      return '<span class="hl-bracket">' + token + '</span>';
    });
  }

  var lines = codeText.split('\n');
  var currentLine = 0;
  var currentChar = 0;
  var lineElements = [];

  function createLine(num) {
    var div = document.createElement('div');
    div.className = 'code-line';
    div.innerHTML =
      '<span class="line-num">' + num + '</span><span class="line-code"></span>';
    container.appendChild(div);
    return div.querySelector('.line-code');
  }

  function typeNextChar() {
    if (currentLine >= lines.length) {
      // Done — add persistent blinking cursor at end
      var last = lineElements[lineElements.length - 1];
      if (last) {
        last.innerHTML =
          highlightLine(lines[lines.length - 1]) +
          '<span class="cursor-blink"></span>';
      }
      return;
    }

    var line = lines[currentLine];

    // Create the line element on first visit
    if (!lineElements[currentLine]) {
      lineElements[currentLine] = createLine(currentLine + 1);
    }

    var lineEl = lineElements[currentLine];

    if (currentChar <= line.length) {
      var partial = line.substring(0, currentChar);
      lineEl.innerHTML =
        highlightLine(partial) + '<span class="cursor-blink"></span>';
      currentChar++;

      // Randomised typing speed: 25-55 ms per character
      var delay = currentChar <= line.length ? 25 + Math.random() * 30 : 0;
      setTimeout(typeNextChar, delay);
    } else {
      // Finished this line — remove cursor, show fully highlighted text
      lineEl.innerHTML = highlightLine(line);
      currentLine++;
      currentChar = 0;

      // Longer pause at blank lines or structural braces
      var nextDelay =
        line.trim() === '' || line.includes('{') || line.includes('}')
          ? 150 + Math.random() * 100
          : 80 + Math.random() * 40;
      setTimeout(typeNextChar, nextDelay);
    }
  }

  // Show the complete code immediately when motion is reduced.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    lines.forEach(function (line, index) { createLine(index + 1).innerHTML = highlightLine(line); });
  } else {
    window.addEventListener('portfolio:ready', function () { setTimeout(typeNextChar, 420); }, { once: true });
  }
})();

/* 5. Terminal Boot Sequence (index.html only)
   ------------------------------------------------------------ */
(function () {
  var terminal = document.getElementById('terminalBody');
  if (!terminal) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function addLine(html, className) {
    var div = document.createElement('div');
    div.className = 'term-line' + (className ? ' ' + className : '');
    div.innerHTML = html;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function typeCommand(text, callback) {
    var div = document.createElement('div');
    div.className = 'term-line';
    div.innerHTML =
      '<span class="term-prompt">$ </span>' +
      '<span class="term-cmd"></span>' +
      '<span class="term-cursor"></span>';
    terminal.appendChild(div);

    var cmdSpan = div.querySelector('.term-cmd');
    var cursorSpan = div.querySelector('.term-cursor');

    if (reduceMotion) {
      cmdSpan.textContent = text;
      cursorSpan.remove();
      if (callback) callback();
      return;
    }

    var i = 0;
    function type() {
      if (i < text.length) {
        cmdSpan.textContent += text[i];
        i++;
        setTimeout(type, 35 + Math.random() * 25);
      } else {
        cursorSpan.remove();
        if (callback) callback();
      }
    }
    type();
  }

  var bootLines = [
    { text: '  interface ............. ok', class: 'term-output', delay: 450 },
    { text: '  application ........... ok', class: 'term-output', delay: 450 },
    { text: '  systems ............... ok', class: 'term-output', delay: 450 },
    { text: '  infrastructure ........ ok', class: 'term-output', delay: 450 },
    { text: '→ all layers online', class: 'term-success', delay: 450 }
  ];

  function showBootLines(index) {
    if (index >= bootLines.length) {
      // Final prompt with blinking cursor
      var finalDiv = document.createElement('div');
      finalDiv.className = 'term-line';
      finalDiv.innerHTML =
        '<span class="term-prompt">$ </span><span class="term-cursor"></span>';
      var lastLine = terminal.lastElementChild;
      if (lastLine) { lastLine.insertAdjacentHTML('beforeend', '<span class="term-cursor"></span>'); }
      terminal.scrollTop = terminal.scrollHeight;
      return;
    }

    var line = bootLines[index];
    if (line.text === '') {
      addLine('&nbsp;');
    } else {
      addLine(line.text, line.class);
    }

    var delay = reduceMotion ? 0 : line.delay;
    setTimeout(function () { showBootLines(index + 1); }, delay);
  }

  // Start boot sequence after 500 ms
  window.addEventListener('portfolio:ready', function () {
    typeCommand('boot --profile sunny', function () {
      setTimeout(
        function () { showBootLines(0); },
        reduceMotion ? 0 : 500
      );
    });
  }, { once: true });
})();

/* 6. Hero shortcut keyboard
   ------------------------------------------------------------ */
(function () {
  var keyboard = document.getElementById('heroKeyboard');
  if (!keyboard) return;
  var status = document.getElementById('keyboardStatus');
  var sessionActive = false;
  var sequenceTimer;
  var sequenceId = 0;
  var labels = {
    session: 'you want to view your session?',
    'copy-email': 'copy my email address',
    github: 'github · danielnoelle',
    contact: 'contact · let’s work together'
  };
  function activate(key) {
    var action = key.getAttribute('data-action');
    if (!action) return;
    if (action === 'sound') {
      key.classList.add('is-active');
      window.setTimeout(function () { key.classList.remove('is-active'); }, 220);
      return;
    }
    sequenceId++;
    window.clearTimeout(sequenceTimer);
    sessionActive = false;
    keyboard.classList.remove('is-inspecting');
    keyboard.querySelectorAll('.keyboard-key').forEach(function (item) { item.classList.remove('is-active'); });
    key.classList.add('is-active');
    if (status) status.textContent = labels[action] || 'shortcut selected';
    window.setTimeout(function () { key.classList.remove('is-active'); }, 220);
    if (action === 'copy-email') copyEmail();
    if (action === 'github') window.open('https://github.com/danielnoelle', '_blank', 'noopener');
    if (action === 'contact') window.location.href = 'contact.html';
    if (action === 'session') showSessionInfo();
  }
  function copyEmail() {
    var email = 'danielnoel.guillen@protonmail.com';
    var currentSequence = sequenceId;
    function report(copied) {
      if (status && currentSequence === sequenceId) status.textContent = copied ? 'email copied · ready to paste' : email;
    }
    function fallback() {
      var input = document.createElement('textarea');
      input.value = email;
      input.style.cssText = 'position:fixed;top:0;left:-9999px';
      document.body.appendChild(input);
      input.select();
      var copied = false;
      try { copied = document.execCommand('copy'); } catch (e) {}
      input.remove();
      keyboard.querySelector('[data-action="copy-email"]').focus({ preventScroll: true });
      report(copied);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(email).then(function () { report(true); }, fallback);
    else fallback();
  }
  function browserName() {
    var ua = navigator.userAgent;
    var match;
    function version(value) { return value.split('.').slice(0, 2).join('.'); }
    if ((match = ua.match(/Edg\/([\d.]+)/))) return 'Edge ' + version(match[1]);
    if ((match = ua.match(/OPR\/([\d.]+)/))) return 'Opera ' + version(match[1]);
    if ((match = ua.match(/Chrome\/([\d.]+)/))) return 'Chrome ' + version(match[1]);
    if ((match = ua.match(/Firefox\/([\d.]+)/))) return 'Firefox ' + version(match[1]);
    if ((match = ua.match(/Version\/([\d.]+).*Safari\//))) return 'Safari ' + version(match[1]);
    return 'Browser';
  }
  function deviceName() {
    var ua = navigator.userAgent;
    if (/iPad|Tablet/i.test(ua)) return 'Tablet';
    if (/Mobi|Android/i.test(ua)) return 'Mobile';
    return 'Desktop';
  }
  function typeSessionLines(lines) {
    var currentSequence = sequenceId;
    window.clearTimeout(sequenceTimer);
    var lineIndex = 0;
    function typeLine() {
      if (currentSequence !== sequenceId || !status) return;
      var line = lines[lineIndex];
      var character = 0;
      status.textContent = '';
      function write() {
        if (currentSequence !== sequenceId) return;
        status.textContent = line.slice(0, character++);
        if (character <= line.length) sequenceTimer = window.setTimeout(write, 28);
        else if (lineIndex === lines.length - 1) sessionActive = false;
        else sequenceTimer = window.setTimeout(erase, 1250);
      }
      function erase() {
        if (currentSequence !== sequenceId) return;
        var value = status.textContent;
        if (value.length) {
          status.textContent = value.slice(0, -1);
          sequenceTimer = window.setTimeout(erase, 20);
        } else {
          lineIndex++;
          sequenceTimer = window.setTimeout(typeLine, 260);
        }
      }
      write();
    }
    typeLine();
  }
  function showSessionInfo() {
    sessionActive = true;
    var currentSequence = sequenceId;
    keyboard.classList.add('is-inspecting');
    var localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    var localLines = function (network) {
      var now;
      try { now = new Intl.DateTimeFormat([], { timeZone: network.timezone || localTimezone, dateStyle: 'medium', timeStyle: 'medium' }).format(new Date()); } catch (e) { now = new Date().toLocaleString(); }
      return [
        'Location: ' + (network.location || 'unavailable'),
        'IP: ' + (network.ip || 'unavailable'),
        'ISP: ' + (network.isp || 'unavailable'),
        'Coordinates: ' + (network.coords || 'unavailable'),
        'Device: ' + deviceName(),
        'Browser: ' + browserName(),
        'Time & Timezone: ' + now + ' · ' + (network.timezone || localTimezone),
        'Be careful on what you press online.'
      ];
    };
    if (status) status.textContent = 'resolving visitor profile';
    fetch('https://ipwho.is/', { headers: { Accept: 'application/json' } })
      .then(function (response) { if (!response.ok) throw new Error('lookup failed'); return response.json(); })
      .then(function (data) {
        if (currentSequence !== sequenceId) return;
        if (data.success !== true) throw new Error('lookup failed');
        var place = [data.city, data.region, data.country].filter(Boolean).join(', ');
        var coords = data.latitude != null && data.longitude != null && Number.isFinite(Number(data.latitude)) && Number.isFinite(Number(data.longitude))
          ? Number(data.latitude).toFixed(1) + ', ' + Number(data.longitude).toFixed(1)
          : 'Unavailable';
        var connection = data.connection || {};
        var timezone = data.timezone || {};
        typeSessionLines(localLines({ location: place, ip: data.ip, isp: connection.isp || connection.org, coords: coords, timezone: timezone.id || localTimezone }));
      })
      .catch(function () {
        if (currentSequence !== sequenceId) return;
        typeSessionLines(localLines({ timezone: localTimezone }));
      });
  }
  keyboard.addEventListener('click', function (event) {
    var key = event.target.closest('.keyboard-key');
    if (key) activate(key);
  });
  keyboard.addEventListener('pointerover', function (event) {
    var key = event.target.closest('.keyboard-key');
    if (key && status && !sessionActive && key.getAttribute('data-action') !== 'sound') status.textContent = labels[key.getAttribute('data-action')] || 'shortcut selected';
  });
  keyboard.addEventListener('pointerleave', function () {
    if (status && !sessionActive) status.textContent = 'select a key to explore';
  });
})();

/* Contact form: native HTTPS submission keeps provider reCAPTCHA enabled. */
(function () {
  var form = document.getElementById('contactForm');
  if (!form) return;
  var status = document.getElementById('formStatus');
  var submitBtn = document.getElementById('formSubmitBtn');
  var returnUrl = document.getElementById('contactReturnUrl');
  var idleLabel = submitBtn.innerHTML;
  var submitted = false;

  if (returnUrl && /^https?:$/.test(window.location.protocol)) {
    returnUrl.value = window.location.origin + window.location.pathname + '?sent=1';
  }
  if (new URLSearchParams(window.location.search).get('sent') === '1') {
    status.className = 'form-status success';
    status.textContent = 'Thank you. Your message has been submitted.';
  }
  ['name', 'message'].forEach(function (name) {
    var field = form.elements.namedItem(name);
    field.addEventListener('input', function () { field.setCustomValidity(''); });
  });
  form.addEventListener('submit', function (event) {
    if (submitted) { event.preventDefault(); return; }
    var valid = true;
    ['name', 'message'].forEach(function (name) {
      var field = form.elements.namedItem(name);
      field.setCustomValidity(field.value.trim() ? '' : 'Please fill out this field.');
      if (!field.value.trim()) valid = false;
    });
    if (!valid || !form.reportValidity()) { event.preventDefault(); return; }
    if (window.location.protocol === 'file:') {
      event.preventDefault();
      var values = new FormData(form);
      var subject = encodeURIComponent('Portfolio contact from ' + (values.get('name') || 'a new contact'));
      var body = encodeURIComponent('Name: ' + (values.get('name') || '') + '\nEmail: ' + (values.get('email') || '') + '\n\n' + (values.get('message') || ''));
      submitted = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Opening email…';
      status.className = 'form-status success';
      status.textContent = 'Opening your email app with the message ready to send.';
      window.location.href = 'mailto:danielnoel.guillen@protonmail.com?subject=' + subject + '&body=' + body;
      window.setTimeout(function () { submitted = false; submitBtn.disabled = false; submitBtn.innerHTML = idleLabel; }, 800);
      return;
    }
    // Allow the browser to submit directly to FormSubmit's secure endpoint.
    submitted = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    form.setAttribute('aria-busy', 'true');
    status.className = 'form-status';
    status.textContent = 'Connecting securely. Complete the verification on the next page.';
  });
  window.addEventListener('pageshow', function () {
    submitted = false;
    submitBtn.disabled = false;
    submitBtn.innerHTML = idleLabel;
    form.removeAttribute('aria-busy');
    if (status.className === 'form-status') status.textContent = '';
  });
})();

/* 7. Active Nav Link Highlighting
   ------------------------------------------------------------ */
(function () {
  var links = document.querySelectorAll('.nav-link');
  var path = window.location.pathname;

  links.forEach(function (link) {
    var href = link.getAttribute('href');
    if (
      path.endsWith(href) ||
      (path.endsWith('/') && href === 'index.html')
    ) {
      link.classList.add('active');
    }
  });
})();

/* 8. Header Scroll Effect
   ------------------------------------------------------------ */
(function () {
  var header = document.querySelector('header');
  if (!header) return;

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
})();





/* 9. A brief welcome illustration on first entry and Home reloads.
   Internal links use normal browser navigation without a loading overlay.
   ------------------------------------------------------------ */
(function () {
  var loader = document.getElementById('siteLoader');
  if (!loader) return;
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var showIntro = root.classList.contains('intro-pending') && !reduced;
  var finished = false;
  var minimumTimer;
  var safetyTimer;
  try {
    sessionStorage.setItem('danii-intro-seen', '1');
  } catch (e) { /* The early gate already falls back to navigation information. */ }

  function revealHashTarget() {
    if (!window.location.hash) return;
    var target;
    try { target = document.getElementById(decodeURIComponent(window.location.hash.slice(1))); } catch (e) { return; }
    if (!target) return;
    target.classList.add('visible');
    requestAnimationFrame(function () {
      target.scrollIntoView({ behavior: 'instant', block: 'start' });
      if (target.hasAttribute('tabindex')) target.focus({ preventScroll: true });
    });
  }

  function finishLoading() {
    if (finished) return;
    finished = true;
    window.clearTimeout(minimumTimer);
    window.clearTimeout(safetyTimer);
    window.clearTimeout(window.__daniiIntroFallback);
    loader.classList.add('is-ready');
    root.classList.remove('intro-pending');
    root.classList.add('page-ready');
    loader.setAttribute('aria-hidden', 'true');
    window.dispatchEvent(new Event('portfolio:ready'));
    revealHashTarget();
  }

  if (!showIntro) {
    finishLoading();
    return;
  }

  // Count time already spent loading; never add a new wait after window.load.
  var startedAt = typeof window.__daniiIntroStartedAt === 'number' ? window.__daniiIntroStartedAt : performance.now();
  function scheduleWelcomeEnd() {
    if (finished) return;
    var elapsed = Math.max(0, performance.now() - startedAt);
    minimumTimer = window.setTimeout(finishLoading, Math.max(0, 1600 - elapsed));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scheduleWelcomeEnd, { once: true });
  else scheduleWelcomeEnd();
  safetyTimer = window.setTimeout(finishLoading, Math.max(0, 2600 - (performance.now() - startedAt)));
})();

/* 10. Small pointer-responsive details for the editor
   ------------------------------------------------------------ */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var hero = document.querySelector('.hero-right');
  var editor = document.querySelector('.vscode-editor');
  if (!hero || !editor) return;
  hero.addEventListener('pointermove', function (event) {
    var rect = hero.getBoundingClientRect();
    var x = (event.clientX - rect.left) / rect.width - .5;
    var y = (event.clientY - rect.top) / rect.height - .5;
    editor.style.transform = 'perspective(1100px) rotateY(' + (x * 2.4).toFixed(2) + 'deg) rotateX(' + (-y * 1.8).toFixed(2) + 'deg)';
  });
  hero.addEventListener('pointerleave', function () {
    editor.style.transform = '';
  });
})();


/* Start the visible entrance choreography after the document is available. */
document.documentElement.classList.add('motion-ready');



/* Rotating headline: fixed-size slot, a static accessible label, and reduced-motion support. */
(function () {
  var output = document.getElementById('heroTypewriter');
  if (!output) return;
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var phrases = ['clear systems.', 'smart flows.', 'useful tools.', 'human design.'];
  var phraseIndex = 0;
  var character = phrases[0].length;
  var deleting = true;
  var timer;
  function schedule(delay) { timer = window.setTimeout(step, delay); }
  function step() {
    if (document.hidden) { schedule(600); return; }
    var phrase = phrases[phraseIndex];
    character += deleting ? -1 : 1;
    output.textContent = phrase.slice(0, character);
    if (deleting && character === 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      schedule(350);
    } else if (!deleting && character === phrase.length) {
      deleting = true;
      schedule(2200);
    } else schedule(deleting ? 45 : 90);
  }
  function start() { schedule(2200); }
  window.addEventListener('portfolio:ready', start, { once: true });
  /* The loader can finish before this late script block registers its listener
     (especially on repeat visits), so also start immediately when the page is
     already ready. */
  if (document.documentElement.classList.contains('page-ready')) start();
  motion.addEventListener('change', function () {
    clearTimeout(timer);
    phraseIndex = 0;
    character = phrases[0].length;
    deleting = true;
    output.textContent = phrases[0];
    start();
  });
})();

/* Optional interface sounds: off until explicitly enabled, with a saved preference. */
(function () {
  var button = document.getElementById('soundToggle');
  var AudioContextClass = window.AudioContext || window.webkitAudioContext;
  var enabled = false;
  var context;
  var unlocking;
  var lastHover = 0;
  var selector = 'a[href], button, input:not([type="hidden"]), textarea, select, summary';
  try { enabled = localStorage.getItem('danii-sound') === 'on'; } catch (e) {}

  function sync() {
    if (!button) return;
    button.setAttribute('aria-pressed', String(enabled));
    button.setAttribute('aria-label', enabled ? 'Mute interface sounds' : 'Enable interface sounds');
    button.classList.toggle('is-muted', !enabled);
    button.dataset.audioState = context ? context.state : 'locked';
    button.title = enabled ? (context && context.state === 'running' ? 'Sound on · click to mute' : 'Sound on · starts after your first click') : 'Sound off · click to enable';
  }
  async function unlock() {
    if (!enabled || !AudioContextClass) return false;
    if (unlocking) return unlocking;
    unlocking = (async function () {
      try {
        if (!context) context = new AudioContextClass();
        if (context.state !== 'running') await context.resume();
        sync();
        return context.state === 'running';
      } catch (e) { return false; }
    })();
    try { return await unlocking; } finally { unlocking = null; }
  }
  function tone(kind) {
    if (!enabled || !context || context.state !== 'running') return;
    var now = context.currentTime;
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    var click = kind === 'click';
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(click ? 740 : 480, now);
    oscillator.frequency.exponentialRampToValueAtTime(click ? 520 : 640, now + .06);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.exponentialRampToValueAtTime(click ? .075 : .035, now + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, now + (click ? .13 : .07));
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + .15);
    oscillator.onended = function () { oscillator.disconnect(); gain.disconnect(); };
  }
  if (!AudioContextClass) { if (button) { button.disabled = true; button.title = 'Interface audio is unavailable in this browser'; } return; }
  if (button) button.addEventListener('click', async function () {
      enabled = !enabled;
      try { localStorage.setItem('danii-sound', enabled ? 'on' : 'off'); } catch (e) {}
      sync();
      if (enabled && await unlock()) tone('click');
    });
  document.addEventListener('pointerdown', function () { unlock(); }, { capture: true, passive: true });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ') unlock();
  }, { capture: true });
  document.addEventListener('pointerover', function (event) {
    if (event.pointerType === 'touch') return;
    var target = event.target.closest(selector);
    if (!target || target.disabled || (event.relatedTarget && target.contains(event.relatedTarget))) return;
    var now = performance.now();
    if (now - lastHover < 90) return;
    lastHover = now;
    tone('hover');
  }, { passive: true });
  document.addEventListener('focusin', function (event) {
    if (event.target.matches(selector) && event.target.matches(':focus-visible')) tone('hover');
  });
  document.addEventListener('click', async function (event) {
    var target = event.target.closest(selector);
    if (!target || (button && target === button) || target.disabled) return;
    if (await unlock()) tone('click');
  }, { capture: true });
  sync();
})();
