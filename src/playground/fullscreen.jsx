/**
 * Copyright (C) 2021 Thomas Weber
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import './import-first';

import React, {useEffect} from 'react';

import Interface from './render-interface.jsx';
import render from './app-target';

const GO_ICON_KEY = 'cattymod:goIcon';
const GO_ICON_GREEN_FLAG = 'greenflag';

const FULL_BASE64_GREEN_FLAG =
    'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNi42MyAxNy41Ij48ZGVmcz48c3R5bGU+LmNscy0xLC5jbHMtMntmaWxsOiM0Y2JmNTY7c3Ryb2tlOiM0NTk5M2Q7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO30uY2xzLTJ7c3Ryb2tlLXdpZHRoOjEuNXB4O308L3N0eWxlPjwvZGVmcz48dGl0bGU+aWNvbi0tZ3JlZW4tZmxhZzwvdGl0bGU+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNLjc1LDJBNi40NCw2LjQ0LDAsMCwxLDguNDQsMmgwYTYuNDQsNi40NCwwLDAsMCw3LjY5LDBWMTIuNGE2LjQ0LDYuNDQsMCwwLDEtNy42OSwwaDBhNi40NCw2LjQ0LDAsMCwwLTcuNjksMCIvPjxsaW5lIGNsYXNzPSJjbHMtMiIgeDE9IjAuNzUiIHkxPSIxNi43NSIgeDI9IjAuNzUiIHkyPSIwLjc1Ii8+PC9zdmc+';

const TURBO_GREEN_FLAG =
    'https://turbowarp.org/static/blocks-media/default/green-flag.svg';

const replaceGreenFlags = () => {
    let enabled = false;

    try {
        enabled = localStorage.getItem(GO_ICON_KEY) === GO_ICON_GREEN_FLAG;
    } catch (e) {
        return;
    }

    // Only replace things when Green Flag mode is enabled.
    if (!enabled) return;

    // Replace normal <img> green flags.
    document.querySelectorAll('img').forEach(e => {
        try {
            if (
                (e.className &&
                    e.className.includes &&
                    e.className.includes('green-flag')) ||
                (e.closest &&
                    e.closest('.stage_green-flag-overlay_gNXnv'))
            ) {
                e.src = FULL_BASE64_GREEN_FLAG;
            }
        } catch (err) {
            // Ignore individual elements.
        }
    });

    // Replace SVG <image> green flags.
    document.querySelectorAll('image').forEach(e => {
        try {
            const href =
                e.getAttribute('xlink:href') ||
                e.getAttribute('href');

            if (href && href.includes('green-flag.svg')) {
                e.setAttribute('xlink:href', TURBO_GREEN_FLAG);
                e.setAttribute('href', TURBO_GREEN_FLAG);
            }
        } catch (err) {
            // Ignore individual elements.
        }
    });
};

const startGreenFlagObserver = () => {
    // Run immediately.
    replaceGreenFlags();

    // Keep watching for the menu bar appearing after fullscreen ends.
    if (window._cattymod_player_greenFlagObserver) {
        window._cattymod_player_greenFlagObserver.disconnect();
    }

    const observer = new MutationObserver(() => {
        replaceGreenFlags();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    window._cattymod_player_greenFlagObserver = observer;
};

// Start as soon as the document is ready.
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGreenFlagObserver, {
        once: true
    });
} else {
    startGreenFlagObserver();
}

// Also run when fullscreen is exited.
document.addEventListener('fullscreenchange', () => {
    // Give the UI a moment to add the menu bar.
    setTimeout(replaceGreenFlags, 0);
    setTimeout(replaceGreenFlags, 100);
    setTimeout(replaceGreenFlags, 500);
});

const PlayerOnlyInterface = props => {
    useEffect(() => {
        // Make sure the observer is active when this interface mounts.
        startGreenFlagObserver();

        return () => {
            if (window._cattymod_player_greenFlagObserver) {
                window._cattymod_player_greenFlagObserver.disconnect();
                window._cattymod_player_greenFlagObserver = null;
            }
        };
    }, []);

    return <Interface {...props} />;
};

render(
    <PlayerOnlyInterface
        isPlayerOnly
        isFullScreen
    />
);
