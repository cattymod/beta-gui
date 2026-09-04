import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';

import LanguageMenu from './language-menu.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuSection} from '../menu/menu.jsx';
import MenuLabel from './tw-menu-label.jsx';
import TWAccentThemeMenu from './tw-theme-accent.jsx';
import TWGuiThemeMenu from './tw-theme-gui.jsx';
import TWBlocksThemeMenu from './tw-theme-blocks.jsx';
import TWDesktopSettings from './tw-desktop-settings.jsx';

import menuBarStyles from './menu-bar.css';
import styles from './settings-menu.css';

import dropdownCaret from './dropdown-caret.svg';
import settingsIcon from './icon--settings.svg';

const GO_ICON_KEY = 'cattymod:goIcon';
const GO_ICON_PLAY = 'play';
const GO_ICON_GREEN_FLAG = 'greenflag';
const TURBO_GREEN_FLAG = 'https://turbowarp.org/static/blocks-media/default/green-flag.svg';
const CATTY_GREEN_FLAG = 'https://cattymod.app/assets/green-flag.svg';

const SettingsMenu = ({
    canChangeLanguage,
    canChangeTheme,
    isRtl,
    onClickDesktopSettings,
    onOpenCustomSettings,
    onRequestClose,
    onRequestOpen,
    settingsMenuOpen
}) => {
    // Keep local state for UI
    const [goIcon, setGoIcon] = useState(() => {
        try {
            const stored = localStorage.getItem(GO_ICON_KEY);
            return stored || GO_ICON_PLAY;
        } catch (e) {
            return GO_ICON_PLAY;
        }
    });

    // Full base64 string provided by the user
    const FULL_BASE64_GREEN_FLAG = 'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNi42MyAxNy41Ij48ZGVmcz48c3R5bGU+LmNscy0xLC5jbHMtMntmaWxsOiM0Y2JmNTY7c3Ryb2tlOiM0NTk5M2Q7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO30uY2xzLTJ7c3Ryb2tlLXdpZHRoOjEuNXB4O308L3N0eWxlPjwvZGVmcz48dGl0bGU+aWNvbi0tZ3JlZW4tZmxhZzwvdGl0bGU+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNLjc1LDJBNi40NCw2LjQ0LDAsMCwxLDguNDQsMmgwYTYuNDQsNi40NCwwLDAsMCw3LjY5LDBWMTIuNGE2LjQ0LDYuNDQsMCwwLDEtNy42OSwwaDBhNi40NCw2LjQ0LDAsMCwwLTcuNjksMCIvPjxsaW5lIGNsYXNzPSJjbHMtMiIgeDE9IjAuNzUiIHkxPSIxNi43NSIgeDI9IjAuNzUiIHkyPSIwLjc1Ii8+PC9zdmc+';

    useEffect(() => {
        // Apply setting on mount and whenever it changes
        applyGoIcon(goIcon);
        // Persist
        try {
            localStorage.setItem(GO_ICON_KEY, goIcon);
        } catch (e) {
            // ignore
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [goIcon]);

    function applyGoIcon(mode) {
        // Clean up previous observer if any
        try {
            if (window._cattymod_goIcon_observer) {
                window._cattymod_goIcon_observer.disconnect();
            }
        } catch (e) {
            // ignore
        }

        // Decide replacement values based on mode
        let imgReplacement; // for <img> elements (e.g., <img class="green-flag" ...>)
        let svgHrefReplacement; // for <image> elements inside SVGs (xlink:href / href)

        if (mode === GO_ICON_GREEN_FLAG) {
            // When selecting "Green Flag" we use the base64 data for img elements
            // and the TurboWarp hosted green flag for inline SVG <image> hrefs (matches user's script)
            imgReplacement = FULL_BASE64_GREEN_FLAG;
            svgHrefReplacement = TURBO_GREEN_FLAG;
        } else {
            // Play Button (default) - point everything to the cattymod hosted green flag
            imgReplacement = CATTY_GREEN_FLAG;
            svgHrefReplacement = CATTY_GREEN_FLAG;
        }

        function replaceAll() {
            try {
                document.querySelectorAll('img').forEach(e => {
                    try {
                        // original script replaced imgs that either have class including "green-flag"
                        // or are inside an element matching the stage overlay class. Preserve that logic.
                        if ((e.className && e.className.includes && e.className.includes('green-flag')) || (e.closest && e.closest('.stage_green-flag-overlay_gNXnv'))) {
                            e.src = imgReplacement;
                        }
                    } catch (err) {
                        // ignore per-element errors
                    }
                });
            } catch (err) {
                // ignore
            }

            try {
                document.querySelectorAll('image').forEach(e => {
                    try {
                        const h = e.getAttribute('xlink:href') || e.getAttribute('href');
                        if (h && h.includes('green-flag.svg')) {
                            e.setAttribute('xlink:href', svgHrefReplacement);
                            e.setAttribute('href', svgHrefReplacement);
                        }
                    } catch (err) {
                        // ignore per-element errors
                    }
                });
            } catch (err) {
                // ignore
            }
        }

        // Run initial replacement
        replaceAll();

        // Observe DOM changes and re-run replacement when nodes added/changed
        try {
            const mo = new MutationObserver(replaceAll);
            mo.observe(document.body, {childList: true, subtree: true});
            // Save observer so we can disconnect later
            window._cattymod_goIcon_observer = mo;
        } catch (e) {
            // ignore
        }
    }

    function onChangeGoIcon(e) {
        const val = e.target.value;
        if (val === GO_ICON_GREEN_FLAG || val === GO_ICON_PLAY) {
            setGoIcon(val);
        }
    }

    return (
        <MenuLabel
            open={settingsMenuOpen}
            onOpen={onRequestOpen}
            onClose={onRequestClose}
        >
            <img
                src={settingsIcon}
                draggable={false}
                width={20}
                height={20}
            />
            <span className={styles.dropdownLabel}>
                <FormattedMessage
                    defaultMessage="Settings"
                    description="Settings menu"
                    id="gui.menuBar.settings"
                />
            </span>
            <img
                src={dropdownCaret}
                draggable={false}
                width={8}
                height={5}
            />
            <MenuBarMenu
                className={menuBarStyles.menuBarMenu}
                open={settingsMenuOpen}
                place={isRtl ? 'left' : 'right'}
            >
                <MenuSection>
                    {canChangeLanguage && <LanguageMenu onRequestCloseSettings={onRequestClose} />}
                    {canChangeTheme && (
                        <React.Fragment>
                            <TWGuiThemeMenu />
                            <TWBlocksThemeMenu
                                onOpenCustomSettings={onOpenCustomSettings}
                            />
                            <TWAccentThemeMenu />
                        </React.Fragment>
                    )}
                    {onClickDesktopSettings && <TWDesktopSettings onClick={onClickDesktopSettings} />}
                </MenuSection>

                {/* New Go Icon section */}
                <MenuSection>
                    <div className={styles.sectionTitle} style={{padding: '6px 12px', fontWeight: 'bold'}}>
                        Go Icon
                    </div>
                    <div style={{padding: '4px 12px'}}>
                        <label style={{display: 'block', marginBottom: 6}}>
                            <input
                                type="radio"
                                name="goIcon"
                                value={GO_ICON_PLAY}
                                checked={goIcon === GO_ICON_PLAY}
                                onChange={onChangeGoIcon}
                            />
                            <span style={{marginLeft: 8}}>Play Button (default)</span>
                        </label>

                        <label style={{display: 'block', marginBottom: 6}}>
                            <input
                                type="radio"
                                name="goIcon"
                                value={GO_ICON_GREEN_FLAG}
                                checked={goIcon === GO_ICON_GREEN_FLAG}
                                onChange={onChangeGoIcon}
                            />
                            <span style={{marginLeft: 8}}>Green Flag</span>
                        </label>
                    </div>
                </MenuSection>

            </MenuBarMenu>
        </MenuLabel>
    );
};

SettingsMenu.propTypes = {
    canChangeLanguage: PropTypes.bool,
    canChangeTheme: PropTypes.bool,
    isRtl: PropTypes.bool,
    onClickDesktopSettings: PropTypes.func,
    onOpenCustomSettings: PropTypes.func,
    onRequestClose: PropTypes.func,
    onRequestOpen: PropTypes.func,
    settingsMenuOpen: PropTypes.bool
};

export default SettingsMenu;
