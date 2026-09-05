// go-icon.js

export const GO_ICON_KEY = 'cattymod:goIcon';

export const GO_ICON_PLAY = 'play';
export const GO_ICON_GREEN_FLAG = 'greenflag';

export const TURBO_GREEN_FLAG =
    'https://turbowarp.org/static/blocks-media/default/green-flag.svg';

export const CATTY_GREEN_FLAG =
    'https://cattymod.app/assets/green-flag.svg';

export const FULL_BASE64_GREEN_FLAG =
    'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNi42MyAxNy41Ij48ZGVmcz48c3R5bGU+LmNscy0xLC5jbHMtMntmaWxsOiM0Y2JmNTY7c3Ryb2tlOiM0NTk5M2Q7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO30uY2xzLTJ7c3Ryb2tlLXdpZHRoOjEuNXB4O308L3N0eWxlPjwvZGVmcz48dGl0bGU+aWNvbi0tZ3JlZW4tZmxhZzwvdGl0bGU+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNLjc1LDJBNi40NCw2LjQ0LDAsMCwxLDguNDQsMmgwYTYuNDQsNi40NCwwLDAsMCw3LjY5LDBWMTIuNGE2LjQ0LDYuNDQsMCwwLDEtNy42OSwwaDBhNi40NCw2LjQ0LDAsMCwwLTcuNjksMCIvPjxsaW5lIGNsYXNzPSJjbHMtMiIgeDE9IjAuNzUiIHkxPSIxNi43NSIgeDI9IjAuNzUiIHkyPSIwLjc1Ii8+PC9zdmc+';

export const getGoIcon = () => {
    try {
        return localStorage.getItem(GO_ICON_KEY) || GO_ICON_PLAY;
    } catch (e) {
        return GO_ICON_PLAY;
    }
};

export const setGoIcon = mode => {
    if (
        mode !== GO_ICON_PLAY &&
        mode !== GO_ICON_GREEN_FLAG
    ) {
        return;
    }

    try {
        localStorage.setItem(GO_ICON_KEY, mode);
    } catch (e) {
        // Ignore localStorage errors.
    }
};

export const getGoIconImage = mode => (
    mode === GO_ICON_GREEN_FLAG ?
        FULL_BASE64_GREEN_FLAG :
        CATTY_GREEN_FLAG
);

export const getGoIconSvg = mode => (
    mode === GO_ICON_GREEN_FLAG ?
        TURBO_GREEN_FLAG :
        CATTY_GREEN_FLAG
);

/*
 * Replace all green flag icons currently on the page.
 */
export const replaceGreenFlags = mode => {
    if (!navigator.onLine) {
        return;
    }

    const imgReplacement = getGoIconImage(mode);
    const svgHrefReplacement = getGoIconSvg(mode);

    try {
        document.querySelectorAll('img').forEach(e => {
            try {
                if (
                    (
                        e.className &&
                        e.className.includes &&
                        e.className.includes('green-flag')
                    ) ||
                    (
                        e.closest &&
                        e.closest(
                            '.stage_green-flag-overlay_gNXnv'
                        )
                    )
                ) {
                    e.src = imgReplacement;
                }
            } catch (err) {
                // Ignore individual element errors.
            }
        });
    } catch (err) {
        // Ignore query errors.
    }

    try {
        document.querySelectorAll('image').forEach(e => {
            try {
                const href =
                    e.getAttribute('xlink:href') ||
                    e.getAttribute('href');

                if (href && href.includes('green-flag.svg')) {
                    e.setAttribute(
                        'xlink:href',
                        svgHrefReplacement
                    );

                    e.setAttribute(
                        'href',
                        svgHrefReplacement
                    );
                }
            } catch (err) {
                // Ignore individual element errors.
            }
        });
    } catch (err) {
        // Ignore query errors.
    }
};

/*
 * Stop the current green flag observer.
 */
export const stopGoIconObserver = () => {
    try {
        if (window._cattymod_goIcon_observer) {
            window._cattymod_goIcon_observer.disconnect();
            window._cattymod_goIcon_observer = null;
        }
    } catch (e) {
        // Ignore observer errors.
    }
};

/*
 * Start watching the page for newly-created green flag icons.
 */
export const startGoIconObserver = () => {
    if (!navigator.onLine) {
        return;
    }

    stopGoIconObserver();

    const mode = getGoIcon();

    replaceGreenFlags(mode);

    try {
        const observer = new MutationObserver(() => {
            if (!navigator.onLine) {
                stopGoIconObserver();
                return;
            }

            replaceGreenFlags(mode);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        window._cattymod_goIcon_observer = observer;
    } catch (e) {
        // Ignore MutationObserver errors.
    }
};

/*
 * Apply a new Go Icon mode.
 */
export const applyGoIcon = mode => {
    if (
        mode !== GO_ICON_PLAY &&
        mode !== GO_ICON_GREEN_FLAG
    ) {
        return;
    }

    setGoIcon(mode);

    if (!navigator.onLine) {
        stopGoIconObserver();
        return;
    }

    startGoIconObserver();
};

/*
 * Re-apply the icon after fullscreen changes.
 *
 * TurboWarp can recreate parts of the UI when fullscreen
 * is entered or exited, so give it a few chances to finish.
 */
export const handleGoIconFullscreenChange = () => {
    setTimeout(() => {
        if (navigator.onLine) {
            startGoIconObserver();
        }
    }, 0);

    setTimeout(() => {
        if (navigator.onLine) {
            startGoIconObserver();
        }
    }, 100);

    setTimeout(() => {
        if (navigator.onLine) {
            startGoIconObserver();
        }
    }, 500);
};

/*
 * Automatically start the observer when the document is ready.
 */
export const initializeGoIcon = () => {
    if (typeof document === 'undefined') {
        return;
    }

    const start = () => {
        if (navigator.onLine) {
            startGoIconObserver();
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            start,
            {once: true}
        );
    } else {
        start();
    }

    document.addEventListener(
        'fullscreenchange',
        handleGoIconFullscreenChange
    );
};
