export function startTour(onComplete) {
    if (window.__cattyModTour) return;

    setTimeout(() => {
        startTourNow(onComplete);
    }, 500);
}

function startTourNow(onComplete) {
    function getTarget(step) {
        if (step.sel) return document.querySelector(step.sel);

        if (step.text) {
            var spans = document.querySelectorAll('span');

            for (var i = 0; i < spans.length; i++) {
                if (
                    spans[i].textContent.trim().toLowerCase() ===
                    step.text.toLowerCase()
                ) {
                    return spans[i].closest('.menu-bar_menu-bar-item_oLDa-') || spans[i];
                }
            }
        }

        return null;
    }

    function markTourCompleted() {
        localStorage.setItem('cattymod:tourCompleted', 'true');
    }

    var steps = [{
            type: 'welcome',
            title: 'Welcome to CattyMod!',
            desc: "Hey! Let's take a quick look around!"
        },
        {
            type: 'target',
            text: 'Settings',
            position: 'below',
            desc: 'Here you can configure CattyMod.'
        },
        {
            type: 'target',
            text: 'File',
            position: 'below',
            desc: 'Open, save, and create new projects here.'
        },
        {
            type: 'target',
            text: 'Edit',
            position: 'below',
            desc: 'Here you can configure your project and undo changes.'
        },
        {
            type: 'target',
            sel: '.sa-find-wrapper',
            position: 'below',
            desc: 'This is the Find Box! Search for blocks in your project by typing their names.'
        },
        {
            type: 'target',
            sel: '.gui_blocks-wrapper_1ccgf, .blocklySvg, .scratchCategoryMenu',
            position: 'middle',
            desc: 'This is where you can code using blocks!'
        },
        {
            type: 'target',
            sel: '.gui_extension-button-container_b4rCs',
            position: 'below',
            desc: 'Click here to add extensions to your project and unlock even more blocks!'
        },
        {
            type: 'target',
            sel: '.stage_stage_1fD7k',
            position: 'below',
            desc: 'Here is the Stage, where your project comes to life!'
        },
        {
            type: 'target',
            sel: '.controls_controls-container_2xinB',
            position: 'below',
            desc: 'Use these controls to start, pause, and stop your project.'
        },
        {
            type: 'end',
            title: 'Tour Complete',
            desc: "That's it for the tour! Have fun!"
        }
    ];

    var currentStep = 0;

    var overlay = document.createElement('div');
    overlay.id = 'cm-tour-overlay';
    overlay.style.cssText =
        'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:999999;pointer-events:none;font-family:sans-serif;';

    document.body.appendChild(overlay);

    var style = document.createElement('style');
    style.id = 'cm-tour-styles';

    style.textContent = `
    @keyframes cmPulse {
      0% {
        box-shadow: 0 0 0 0 rgba(76,151,255,0.8),
                    0 0 12px rgba(76,151,255,0.3);
      }
      50% {
        box-shadow: 0 0 0 9px rgba(76,151,255,0.15),
                    0 0 25px rgba(76,151,255,0.65);
      }
      100% {
        box-shadow: 0 0 0 15px rgba(76,151,255,0),
                    0 0 12px rgba(76,151,255,0.3);
      }
    }

    @keyframes cmOpen {
      0% {
        opacity: 0;
        transform: translate(-50%, -46%) scale(0.75);
      }
      65% {
        opacity: 1;
        transform: translate(-50%, -52%) scale(1.04);
      }
      100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
    }

    @keyframes cmClose {
      from {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1);
      }
      to {
        opacity: 0;
        transform: translate(-50%, -46%) scale(0.8);
      }
    }

    @keyframes cmStepIn {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes cmEndIn {
      0% {
        opacity: 0;
        transform: translate(-50%, -45%) scale(0.7) rotate(-3deg);
      }
      65% {
        opacity: 1;
        transform: translate(-50%, -52%) scale(1.05) rotate(1deg);
      }
      100% {
        opacity: 1;
        transform: translate(-50%, -50%) scale(1) rotate(0);
      }
    }

    .cm-highlight {
      outline: 4px solid #4C97FF !important;
      outline-offset: 3px !important;
      border-radius: 5px !important;
      background-color: rgba(76,151,255,0.12) !important;
      animation: cmPulse 1.8s infinite !important;
      position: relative;
      z-index: 999998 !important;
    }

    .cm-box {
      position: fixed;
      background: #fff;
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 15px 45px rgba(0,0,0,0.3);
      border: 1px solid #e0e0e0;
      width: 420px;
      pointer-events: auto;
      color: #333;
      font-family: system-ui, -apple-system, sans-serif;
      box-sizing: border-box;
      text-align: center;
      opacity: 0;
    }

    .cm-box-small {
      width: 290px;
      padding: 20px;
      border-radius: 12px;
      text-align: left;
    }

    .cm-icon-box {
      width: 56px;
      height: 56px;
      background: #eef4ff;
      color: #4C97FF;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px auto;
      animation: cmStepIn 0.5s ease both;
    }

    .cm-box h3 {
      margin: 0 0 10px;
      font-size: 22px;
      color: #111;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .cm-box-small h3 {
      font-size: 17px;
      justify-content: flex-start;
    }

    .cm-box p {
      margin: 0 0 24px;
      font-size: 15px;
      color: #555;
      line-height: 1.5;
    }

    .cm-box-small p {
      margin-bottom: 16px;
      font-size: 13px;
      text-align: left;
    }

    .cm-close {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      cursor: pointer;
      color: #888;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 6px;
      border-radius: 6px;
    }

    .cm-close:hover {
      color: #000;
      background: #f0f0f0;
    }

    .cm-btn-group {
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      align-items: center;
    }

    .cm-box:not(.cm-box-small) .cm-btn-group {
      justify-content: center;
    }

    .cm-btn {
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      font-size: 14px;
      transition: background 0.2s, transform 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .cm-btn:hover {
      transform: translateY(-2px);
    }

    .cm-btn-primary {
      background: #4C97FF;
      color: #fff;
    }

    .cm-btn-primary:hover {
      background: #3373CC;
    }

    .cm-btn-sec {
      background: #e4e6eb;
      color: #333;
    }

    .cm-btn-sec:hover {
      background: #d8dadf;
    }
  `;

    document.head.appendChild(style);

    var box = document.createElement('div');
    box.className = 'cm-box';
    overlay.appendChild(box);

    window.__cattyModTour = true;

    var originalPushState = history.pushState;
    var originalReplaceState = history.replaceState;

    function checkTourURL() {
        if (
            window.location.pathname === '/' ||
            window.location.pathname === '/fullscreen'
        ) {
            cleanup();
        }
    }

    function cleanup() {
        document.querySelectorAll('.cm-highlight').forEach(el => {
            el.classList.remove('cm-highlight');
        });

        if (overlay) overlay.remove();
        if (style) style.remove();

        window.removeEventListener('popstate', checkTourURL);

        if (history.pushState === wrappedPushState) {
            history.pushState = originalPushState;
        }

        if (history.replaceState === wrappedReplaceState) {
            history.replaceState = originalReplaceState;
        }

        delete window.__cattyModTour;
    }

    var wrappedPushState = function(...args) {
        originalPushState.apply(this, args);
        checkTourURL();
    };

    var wrappedReplaceState = function(...args) {
        originalReplaceState.apply(this, args);
        checkTourURL();
    };

    history.pushState = wrappedPushState;
    history.replaceState = wrappedReplaceState;

    window.addEventListener('popstate', checkTourURL);

    checkTourURL();

    function closeTour() {
        markTourCompleted();
        box.style.animation = 'cmClose 0.3s ease forwards';

        setTimeout(() => {
            cleanup();
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }, 300);
    }

    function render() {
        if (!window.__cattyModTour) return;

        document.querySelectorAll('.cm-highlight').forEach(el => {
            el.classList.remove('cm-highlight');
        });

        var step = steps[currentStep];
        box.innerHTML = '';
        box.style.animation = 'none';

        var closeBtn = document.createElement('button');
        closeBtn.className = 'cm-close';
        closeBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
      </svg>
    `;

        closeBtn.onclick = closeTour;
        box.appendChild(closeBtn);

        if (step.type === 'welcome' || step.type === 'end') {
            box.classList.remove('cm-box-small');
            box.style.top = '50%';
            box.style.left = '50%';
            box.style.transform = 'translate(-50%, -50%)';

            var iconBox = document.createElement('div');
            iconBox.className = 'cm-icon-box';

            iconBox.innerHTML = step.type === 'welcome' ? `
        <svg width="28" height="28" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
      ` : `
        <svg width="28" height="28" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      `;

            box.appendChild(iconBox);
        } else {
            box.classList.add('cm-box-small');

            var target = getTarget(step);

            if (target) {
                target.classList.add('cm-highlight');

                var rect = target.getBoundingClientRect();
                var top;
                var left = rect.left;

                if (step.position === 'below') {
                    top = rect.bottom + 14;

                    if (top + 190 > window.innerHeight) {
                        top = rect.top - 200;
                    }
                } else if (step.position === 'middle') {
                    top = rect.top + (rect.height - 150) / 2;
                    left = rect.left + (rect.width - 290) / 2;
                } else {
                    top = rect.top + rect.height / 2 - 75;
                }

                if (left + 290 > window.innerWidth) {
                    left = window.innerWidth - 310;
                }

                left = Math.max(10, left);
                top = Math.max(10, top);

                box.style.top = Math.max(10, top) + 'px';
                box.style.left = Math.max(10, left) + 'px';
                box.style.transform = 'none';
            } else {
                box.style.top = '50%';
                box.style.left = '50%';
                box.style.transform = 'translate(-50%, -50%)';
            }
        }

        var title = document.createElement('h3');
        title.textContent =
            step.title || (step.text ? step.text : 'Step ' + currentStep);

        box.appendChild(title);

        var desc = document.createElement('p');
        desc.textContent = step.desc;
        box.appendChild(desc);

        var btnGroup = document.createElement('div');
        btnGroup.className = 'cm-btn-group';

        if (step.type === 'welcome') {
            var skipBtn = document.createElement('button');
            skipBtn.className = 'cm-btn cm-btn-sec';
            skipBtn.textContent = 'Skip';
            skipBtn.onclick = closeTour;
            btnGroup.appendChild(skipBtn);

            var startBtn = document.createElement('button');
            startBtn.className = 'cm-btn cm-btn-primary';
            startBtn.innerHTML = `
        Let's go!
        <svg width="15" height="15" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;

            startBtn.onclick = function() {
                currentStep++;
                render();
            };

            btnGroup.appendChild(startBtn);
        } else if (step.type === 'end') {
            var endBtn = document.createElement('button');
            endBtn.className = 'cm-btn cm-btn-primary';
            endBtn.textContent = 'End Tour';
            endBtn.onclick = closeTour;
            btnGroup.appendChild(endBtn);
        } else {
            var nextBtn = document.createElement('button');
            nextBtn.className = 'cm-btn cm-btn-primary';
            nextBtn.innerHTML = `
        Next
        <svg width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      `;

            nextBtn.onclick = function() {
                currentStep++;
                render();
            };

            btnGroup.appendChild(nextBtn);
        }

        box.appendChild(btnGroup);

        // Animate each new step.
        if (step.type === 'welcome') {
            box.style.animation = 'cmOpen 0.55s cubic-bezier(.2,.8,.2,1) forwards';
        } else if (step.type === 'end') {
            box.style.animation = 'cmEndIn 0.65s cubic-bezier(.2,.8,.2,1) forwards';
        } else {
            box.style.animation = 'cmStepIn 0.3s ease forwards';
        }
    }

    render();
}
