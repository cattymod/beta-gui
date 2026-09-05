import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {FormattedMessage} from 'react-intl';

import LanguageMenu from './language-menu.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuItem, MenuSection, Submenu} from '../menu/menu.jsx';
import MenuLabel from './tw-menu-label.jsx';
import TWAccentThemeMenu from './tw-theme-accent.jsx';
import TWGuiThemeMenu from './tw-theme-gui.jsx';
import TWBlocksThemeMenu from './tw-theme-blocks.jsx';
import TWDesktopSettings from './tw-desktop-settings.jsx';

import {
    accentMenuOpen,
    blocksThemeMenuOpen,
    languageMenuOpen,
    closeAccentMenu,
    closeBlocksThemeMenu,
    closeLanguageMenu
} from '../../reducers/menus';

import menuBarStyles from './menu-bar.css';
import styles from './settings-menu.css';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';
import settingsIcon from './icon--settings.svg';

const GO_ICON_KEY = 'cattymod:goIcon';

const GO_ICON_PLAY = 'play';
const GO_ICON_GREEN_FLAG = 'greenflag';

const TURBO_GREEN_FLAG =
    'https://turbowarp.org/static/blocks-media/default/green-flag.svg';

const CATTY_GREEN_FLAG =
    'https://cattymod.app/assets/green-flag.svg';

const FULL_BASE64_GREEN_FLAG =
     'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNi42MyAxNy41Ij48ZGVmcz48c3R5bGU+LmNscy0xLC5jbHMtMntmaWxsOiM0Y2JmNTY7c3Ryb2tlOiM0NTk5M2Q7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO30uY2xzLTJ7c3Ryb2tlLXdpZHRoOjEuNXB4O308L3N0eWxlPjwvZGVmcz48dGl0bGU+aWNvbi0tZ3JlZW4tZmxhZzwvdGl0bGU+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNLjc1LDJBNi40NCw2LjQ0LDAsMCwxLDguNDQsMmgwYTYuNDQsNi40NCwwLDAsMCw3LjY5LDBWMTIuNGE2LjQ0LDYuNDQsMCwwLDEtNy42OSwwaDBhNi40NCw2LjQ0LDAsMCwwLTcuNjksMCIvPjxsaW5lIGNsYXNzPSJjbHMtMiIgeDE9IjAuNzUiIHkxPSIxNi43NSIgeDI9IjAuNzUiIHkyPSIwLjc1Ii8+PC9zdmc+';
const GoIconPreview = props => (
    <img
        src={props.icon}
        draggable={false}
        width={20}
        height={20}
        alt=""
        style={{
            width: 20,
            height: 20,
            objectFit: 'contain',
            background: 'transparent',
            borderRadius: 0,
            filter: 'brightness(0) invert(1)'
        }}
    />
);

GoIconPreview.propTypes = {
    icon: PropTypes.string
};

const GoIconMenuItem = ({
    icon,
    isSelected,
    label,
    onClick
}) => (
    <MenuItem onClick={onClick}>
        <div className={styles.option}>
            <img
                className={classNames(styles.check, {
                    [styles.selected]: isSelected
                })}
                width={15}
                height={12}
                src={check}
                draggable={false}
                alt=""
            />

            <GoIconPreview icon={icon} />

            <span>{label}</span>
        </div>
    </MenuItem>
);

GoIconMenuItem.propTypes = {
    icon: PropTypes.string,
    isSelected: PropTypes.bool,
    label: PropTypes.string,
    onClick: PropTypes.func
};

const GoIconMenu = ({
    goIcon,
    isOpen,
    isRtl,
    onChangeGoIcon,
    onOpen
}) => (
    <MenuItem expanded={isOpen}>
        <div
            className={styles.option}
            onClick={onOpen}
        >
            <GoIconPreview
                icon={
                    goIcon === GO_ICON_GREEN_FLAG ?
                        FULL_BASE64_GREEN_FLAG :
                        CATTY_GREEN_FLAG
                }
            />

            <span className={styles.submenuLabel}>
                Go Icon
            </span>

            <img
                className={styles.expandCaret}
                src={dropdownCaret}
                draggable={false}
                alt=""
            />
        </div>

        <Submenu place={isRtl ? 'left' : 'right'}>
            <GoIconMenuItem
                icon={CATTY_GREEN_FLAG}
                label="Play Button (default)"
                isSelected={goIcon === GO_ICON_PLAY}
                onClick={() => onChangeGoIcon(GO_ICON_PLAY)}
            />

            <GoIconMenuItem
                icon={FULL_BASE64_GREEN_FLAG}
                label="Green Flag"
                isSelected={goIcon === GO_ICON_GREEN_FLAG}
                onClick={() => onChangeGoIcon(GO_ICON_GREEN_FLAG)}
            />
        </Submenu>
    </MenuItem>
);

GoIconMenu.propTypes = {
    goIcon: PropTypes.string,
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onChangeGoIcon: PropTypes.func,
    onOpen: PropTypes.func
};

const SettingsMenu = ({
    canChangeLanguage,
    canChangeTheme,
    isRtl,
    onClickDesktopSettings,
    onOpenCustomSettings,
    onRequestClose,
    onRequestOpen,
    settingsMenuOpen,
    accentIsOpen,
    blocksThemeIsOpen,
    languageIsOpen,
    closeAccentMenu,
    closeBlocksThemeMenu,
    closeLanguageMenu
}) => {
    const [goIcon, setGoIcon] = useState(() => {
        try {
            const stored = localStorage.getItem(GO_ICON_KEY);
            return stored || GO_ICON_PLAY;
        } catch (e) {
            return GO_ICON_PLAY;
        }
    });

    const [isOnline, setIsOnline] = useState(() => navigator.onLine);

    const [goIconMenuOpen, setGoIconMenuOpen] = useState(false);

    /*
     * If another Settings submenu opens, close Go Icon.
     *
     * Also close Go Icon when the entire Settings menu closes.
     */
    useEffect(() => {
        if (
            accentIsOpen ||
            blocksThemeIsOpen ||
            languageIsOpen ||
            !settingsMenuOpen
        ) {
            setGoIconMenuOpen(false);
        }
    }, [
        accentIsOpen,
        blocksThemeIsOpen,
        languageIsOpen,
        settingsMenuOpen
    ]);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);

            applyGoIcon(goIcon);
        };

        const handleOffline = () => {
            setIsOnline(false);

            setGoIconMenuOpen(false);

            try {
                if (window._cattymod_goIcon_observer) {
                    window._cattymod_goIcon_observer.disconnect();
                    window._cattymod_goIcon_observer = null;
                }
            } catch (e) {
                // Ignore observer errors.
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (navigator.onLine) {
            applyGoIcon(goIcon);
        }

        try {
            localStorage.setItem(GO_ICON_KEY, goIcon);
        } catch (e) {
            // Ignore localStorage errors.
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);

            try {
                if (window._cattymod_goIcon_observer) {
                    window._cattymod_goIcon_observer.disconnect();
                    window._cattymod_goIcon_observer = null;
                }
            } catch (e) {
                // Ignore observer errors.
            }
        };

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [goIcon]);

    function applyGoIcon(mode) {
        if (!navigator.onLine) {
            return;
        }

        try {
            if (window._cattymod_goIcon_observer) {
                window._cattymod_goIcon_observer.disconnect();
                window._cattymod_goIcon_observer = null;
            }
        } catch (e) {
            // Ignore observer errors.
        }

        let imgReplacement;
        let svgHrefReplacement;

        if (mode === GO_ICON_GREEN_FLAG) {
            imgReplacement = FULL_BASE64_GREEN_FLAG;
            svgHrefReplacement = TURBO_GREEN_FLAG;
        } else {
            imgReplacement = CATTY_GREEN_FLAG;
            svgHrefReplacement = CATTY_GREEN_FLAG;
        }

        function replaceAll() {
            if (!navigator.onLine) {
                return;
            }

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
                        const h =
                            e.getAttribute('xlink:href') ||
                            e.getAttribute('href');

                        if (h && h.includes('green-flag.svg')) {
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
        }

        replaceAll();

        if (!navigator.onLine) {
            return;
        }

        try {
            const mo = new MutationObserver(() => {
                if (!navigator.onLine) {
                    mo.disconnect();
                    window._cattymod_goIcon_observer = null;
                    return;
                }

                replaceAll();
            });

            mo.observe(document.body, {
                childList: true,
                subtree: true
            });

            window._cattymod_goIcon_observer = mo;
        } catch (e) {
            // Ignore MutationObserver errors.
        }
    }

    function onChangeGoIcon(mode) {
        if (!navigator.onLine) {
            return;
        }

        if (
            mode !== GO_ICON_PLAY &&
            mode !== GO_ICON_GREEN_FLAG
        ) {
            return;
        }

        setGoIcon(mode);

        setGoIconMenuOpen(false);

        onRequestClose();
    }

    function onOpenGoIconMenu() {
        if (!navigator.onLine) {
            return;
        }

        /*
         * Go Icon is local state, so explicitly close the Redux
         * Settings submenus before opening it.
         */
        if (accentIsOpen) {
            closeAccentMenu();
        }

        if (blocksThemeIsOpen) {
            closeBlocksThemeMenu();
        }

        if (languageIsOpen) {
            closeLanguageMenu();
        }

        setGoIconMenuOpen(true);
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
                alt=""
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
                alt=""
            />

            <MenuBarMenu
                className={menuBarStyles.menuBarMenu}
                open={settingsMenuOpen}
                place={isRtl ? 'left' : 'right'}
            >
                <MenuSection>
                    {canChangeLanguage && (
                        <LanguageMenu
                            onRequestCloseSettings={onRequestClose}
                        />
                    )}

                    {canChangeTheme && (
                        <React.Fragment>
                            <TWGuiThemeMenu />

                            <TWBlocksThemeMenu
                                onOpenCustomSettings={onOpenCustomSettings}
                            />

                            <TWAccentThemeMenu />
                        </React.Fragment>
                    )}

                    {isOnline && (
                        <GoIconMenu
                            goIcon={goIcon}
                            isOpen={goIconMenuOpen}
                            isRtl={isRtl}
                            onChangeGoIcon={onChangeGoIcon}
                            onOpen={onOpenGoIconMenu}
                        />
                    )}

                    {onClickDesktopSettings && (
                        <TWDesktopSettings
                            onClick={onClickDesktopSettings}
                        />
                    )}
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
    settingsMenuOpen: PropTypes.bool,
    accentIsOpen: PropTypes.bool,
    blocksThemeIsOpen: PropTypes.bool,
    languageIsOpen: PropTypes.bool,
    closeAccentMenu: PropTypes.func,
    closeBlocksThemeMenu: PropTypes.func,
    closeLanguageMenu: PropTypes.func
};

const mapStateToProps = state => ({
    accentIsOpen: accentMenuOpen(state),
    blocksThemeIsOpen: blocksThemeMenuOpen(state),
    languageIsOpen: languageMenuOpen(state)
});

const mapDispatchToProps = dispatch => bindActionCreators({
    closeAccentMenu,
    closeBlocksThemeMenu,
    closeLanguageMenu
}, dispatch);

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SettingsMenu);
