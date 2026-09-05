export const GO_ICON_KEY = 'cattymod:goIcon';

export const GO_ICON_PLAY = 'play';
export const GO_ICON_GREEN_FLAG = 'greenflag';
export const GO_ICON_BLUE_FLAG = 'blueflag';
export const GO_ICON_PURPLE_FLAG = 'purpleflag';

const CATTY_GREEN_FLAG =
    'https://cattymod.app/assets/go-icon/play/flag.svg';

const TURBO_GREEN_FLAG =
    'https://cattymod.app/assets/go-icon/green/flag.svg';

const FULL_BASE64_GREEN_FLAG =
    'https://cattymod.app/assets/go-icon/green/blocks.svg';
    
const BLUE_FLAG =
    'https://cattymod.app/assets/go-icon/blue/flag.svg';

const PURPLE_FLAG =
    'https://cattymod.app/assets/go-icon/purple/flag.svg';

const PURPLE_FLAG_BLOCKS =
    'https://cattymod.app/assets/go-icon/purple/blocks.svg';

const isFileProtocol = () =>
    typeof window !== 'undefined' &&
    window.location.protocol === 'file:';

export const getGoIcon = () => {
    if (isFileProtocol()) {
        return GO_ICON_PLAY;
    }

    try {
        const value = window.localStorage.getItem(GO_ICON_KEY);

        if (
            value === GO_ICON_PLAY ||
            value === GO_ICON_GREEN_FLAG ||
            value === GO_ICON_BLUE_FLAG ||
            value === GO_ICON_PURPLE_FLAG
        ) {
            return value;
        }
    } catch (e) {
        // Ignore localStorage errors.
    }

    return GO_ICON_PLAY;
};

export const setGoIcon = mode => {
    if (isFileProtocol()) {
        return;
    }

    if (
        mode !== GO_ICON_PLAY &&
        mode !== GO_ICON_GREEN_FLAG &&
        mode !== GO_ICON_BLUE_FLAG &&
        mode !== GO_ICON_PURPLE_FLAG
    ) {
        return;
    }

    try {
        window.localStorage.setItem(GO_ICON_KEY, mode);
    } catch (e) {
        // Ignore localStorage errors.
    }
};

export const getGoIconImage = mode => {
    switch (mode) {
    case GO_ICON_GREEN_FLAG:
        return FULL_BASE64_GREEN_FLAG;

    case GO_ICON_BLUE_FLAG:
        return BLUE_FLAG;

    case GO_ICON_PURPLE_FLAG:
        return PURPLE_FLAG;

    case GO_ICON_PLAY:
    default:
        return CATTY_GREEN_FLAG;
    }
};

export const getGoIconSvg = mode => {
    switch (mode) {
    case GO_ICON_GREEN_FLAG:
        return TURBO_GREEN_FLAG;

    case GO_ICON_BLUE_FLAG:
        return BLUE_FLAG;

    case GO_ICON_PURPLE_FLAG:
        return PURPLE_FLAG_BLOCKS;

    case GO_ICON_PLAY:
    default:
        return CATTY_GREEN_FLAG;
    }
};

export const replaceGreenFlags = mode => {
    if (
        typeof document === 'undefined' ||
        typeof navigator === 'undefined' ||
        navigator.onLine === false ||
        isFileProtocol()
    ) {
        return;
    }

    /*
     * Normal <img> elements use getGoIconImage().
     *
     * Blockly block <image> elements use getGoIconSvg().
     *
     * This keeps TURBO_GREEN_FLAG exclusively for blocks.
     */
    const normalIcon = getGoIconImage(mode);
    const blockIcon = getGoIconSvg(mode);

    try {
        /*
         * Replace normal <img> green flags.
         */
        document.querySelectorAll('img').forEach(e => {
            try {
                const className =
                    typeof e.className === 'string' ?
                        e.className :
                        '';

                const isGreenFlag =
                    className.includes('green-flag') ||
                    Boolean(
                        e.closest(
                            '.stage_green-flag-overlay_gNXnv'
                        )
                    );

                if (isGreenFlag) {
                    e.src = normalIcon;
                }
            } catch (err) {
                // Ignore individual elements.
            }
        });

        /*
         * Replace the flag inside "when green flag clicked"
         * Blockly blocks.
         *
         * The workspace block does not have a reliable
         * event_whenflagclicked data-id, so detect it by
         * finding a green-flag.svg or blue-flag.svg image
         * inside a .blocklyDraggable block.
         */
        document.querySelectorAll(
            '.blocklyDraggable image'
        ).forEach(e => {
            try {
                const block = e.closest(
                    '.blocklyDraggable'
                );

                if (!block) {
                    return;
                }

                const href =
                    e.getAttribute('href') || '';

                const xlinkHref =
                    e.getAttribute('xlink:href') || '';

                const namespacedXlinkHref =
                    e.getAttributeNS(
                        'http://www.w3.org/1999/xlink',
                        'href'
                    ) || '';

                const isFlag =
                    href.includes('green-flag.svg') ||
                    href.includes('blue-flag.svg') ||
                    xlinkHref.includes('green-flag.svg') ||
                    xlinkHref.includes('blue-flag.svg') ||
                    namespacedXlinkHref.includes(
                        'green-flag.svg'
                    ) ||
                    namespacedXlinkHref.includes(
                        'blue-flag.svg'
                    );

                if (!isFlag) {
                    return;
                }

                /*
                 * BLOCKS ONLY use blockIcon.
                 *
                 * greenflag:
                 *     TURBO_GREEN_FLAG
                 *
                 * blueflag:
                 *     BLUE_FLAG
                 *
                 * purpleflag:
                 *     PURPLE_FLAG_BLOCKS
                 */
                e.setAttribute(
                    'href',
                    blockIcon
                );

                e.setAttribute(
                    'xlink:href',
                    blockIcon
                );

                e.setAttributeNS(
                    'http://www.w3.org/1999/xlink',
                    'href',
                    blockIcon
                );
            } catch (err) {
                // Ignore individual elements.
            }
        });
    } catch (e) {
        // Keep Go Icon from breaking the GUI.
    }
};

export const stopGoIconObserver = () => {
    if (isFileProtocol()) {
        return;
    }

    if (
        typeof window === 'undefined' ||
        !window._cattymod_goIcon_observer
    ) {
        return;
    }

    try {
        window._cattymod_goIcon_observer.disconnect();
    } catch (e) {
        // Ignore observer errors.
    }

    window._cattymod_goIcon_observer = null;
};

export const startGoIconObserver = () => {
    if (
        typeof document === 'undefined' ||
        typeof window === 'undefined' ||
        typeof navigator === 'undefined' ||
        navigator.onLine === false ||
        isFileProtocol()
    ) {
        return;
    }

    stopGoIconObserver();

    const mode = getGoIcon();

    replaceGreenFlags(mode);

    if (typeof MutationObserver === 'undefined') {
        return;
    }

    const observer = new MutationObserver(() => {
        if (
            navigator.onLine === false ||
            isFileProtocol()
        ) {
            try {
                observer.disconnect();
            } catch (e) {
                // Ignore observer errors.
            }

            if (
                typeof window !== 'undefined' &&
                window._cattymod_goIcon_observer === observer
            ) {
                window._cattymod_goIcon_observer = null;
            }

            return;
        }

        replaceGreenFlags(mode);
    });

    window._cattymod_goIcon_observer = observer;

    try {
        observer.observe(
            document.body || document.documentElement,
            {
                childList: true,
                subtree: true
            }
        );
    } catch (e) {
        window._cattymod_goIcon_observer = null;
    }
};

export const applyGoIcon = mode => {
    if (isFileProtocol()) {
        return;
    }

    if (
        mode !== GO_ICON_PLAY &&
        mode !== GO_ICON_GREEN_FLAG &&
        mode !== GO_ICON_BLUE_FLAG &&
        mode !== GO_ICON_PURPLE_FLAG
    ) {
        return;
    }

    setGoIcon(mode);

    if (
        typeof navigator !== 'undefined' &&
        navigator.onLine === false
    ) {
        stopGoIconObserver();
        return;
    }

    startGoIconObserver();
};

export const handleGoIconFullscreenChange = () => {
    if (isFileProtocol()) {
        return;
    }

    if (
        typeof navigator !== 'undefined' &&
        navigator.onLine === false
    ) {
        return;
    }

    const mode = getGoIcon();

    replaceGreenFlags(mode);

    setTimeout(() => {
        if (!isFileProtocol()) {
            replaceGreenFlags(mode);
        }
    }, 0);

    setTimeout(() => {
        if (!isFileProtocol()) {
            replaceGreenFlags(mode);
        }
    }, 100);

    setTimeout(() => {
        if (!isFileProtocol()) {
            replaceGreenFlags(mode);
        }
    }, 500);
};

export const initializeGoIcon = () => {
    if (
        typeof window === 'undefined' ||
        typeof document === 'undefined' ||
        isFileProtocol()
    ) {
        return () => {};
    }

    const initialize = () => {
        if (isFileProtocol()) {
            return;
        }

        startGoIconObserver();
    };

    if (document.readyState === 'loading') {
        document.addEventListener(
            'DOMContentLoaded',
            initialize,
            {once: true}
        );
    } else {
        initialize();
    }

    const fullscreenHandler =
        handleGoIconFullscreenChange;

    document.addEventListener(
        'fullscreenchange',
        fullscreenHandler
    );

    return () => {
        document.removeEventListener(
            'fullscreenchange',
            fullscreenHandler
        );

        stopGoIconObserver();
    };
};
