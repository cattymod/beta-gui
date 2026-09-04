import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';

import {MenuItem, Submenu} from '../menu/menu.jsx';

import {
    openGoIconMenu,
    goIconMenuOpen,
    closeSettingsMenu
} from '../../reducers/menus.js';

import styles from './settings-menu.css';

const GO_ICON_KEY = 'cattymod:goIcon';

const GO_ICON_PLAY = 'play';
const GO_ICON_GREEN_FLAG = 'greenflag';

const TURBO_GREEN_FLAG =
    'https://turbowarp.org/static/blocks-media/default/green-flag.svg';

const CATTY_GREEN_FLAG =
    'https://cattymod.app/assets/green-flag.svg';

const FULL_BASE64_GREEN_FLAG =
    'data:image/svg+xml;base64,PHN2ZyBpZD0iTGF5ZXJfMSIgZGF0YS1uYW1lPSJMYXllciAxIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxNi42MyAxNy41Ij48ZGVmcz48c3R5bGU+LmNscy0xLC5jbHMtMntmaWxsOiM0Y2JmNTY7c3Ryb2tlOiM0NTk5M2Q7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWxpbmVqb2luOnJvdW5kO30uY2xzLTJ7c3Ryb2tlLXdpZHRoOjEuNXB4O308L3N0eWxlPjwvZGVmcz48dGl0bGU+aWNvbi0tZ3JlZW4tZmxhZzwvdGl0bGU+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNLjc1LDJBNi40NCw2LjQ0LDAsMCwxLDguNDQsMmgwYTYuNDQsNi40NCwwLDAsMCw3LjY5LDBWMTIuNGE2LjQ0LDYuNDQsMCwwLDEtNy42OSwwaDBhNi40NCw2LjQ0LDAsMCwwLTcuNjksMCIvPjxsaW5lIGNsYXNzPSJjbHMtMiIgeDE9IjAuNzUiIHkxPSIxNi43NSIgeDI9IjAuNzUiIHkyPSIwLjc1Ii8+PC9zdmc+';

const GO_ICON_LABELS = {
    play: {
        defaultMessage: 'Play Button',
        description: 'Play Button Go Icon',
        id: 'cattymod.goIcon.play'
    },
    greenflag: {
        defaultMessage: 'Green Flag',
        description: 'Green Flag Go Icon',
        id: 'cattymod.goIcon.greenFlag'
    }
};

const GoIcon = ({id}) => {
    const src = id === GO_ICON_GREEN_FLAG
        ? FULL_BASE64_GREEN_FLAG
        : CATTY_GREEN_FLAG;

    return (
        <img
            className={styles.accentIconOuter}
            src={src}
            draggable={false}
            alt=""
        />
    );
};

GoIcon.propTypes = {
    id: PropTypes.string
};

const GoIconMenuItem = ({
    id,
    isSelected,
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

            <GoIcon id={id} />

            <FormattedMessage {...GO_ICON_LABELS[id]} />
        </div>
    </MenuItem>
);

GoIconMenuItem.propTypes = {
    id: PropTypes.string,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func
};

const applyGoIcon = mode => {
    try {
        if (window._cattymod_goIcon_observer) {
            window._cattymod_goIcon_observer.disconnect();
            window._cattymod_goIcon_observer = null;
        }
    } catch (e) {
        // Ignore
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

    const replaceAll = () => {
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
                    // Ignore individual element errors
                }
            });
        } catch (err) {
            // Ignore
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
                    // Ignore individual element errors
                }
            });
        } catch (err) {
            // Ignore
        }
    };

    replaceAll();

    try {
        const observer = new MutationObserver(replaceAll);

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        window._cattymod_goIcon_observer = observer;
    } catch (e) {
        // Ignore
    }
};

const GoIconMenu = ({
    isOpen,
    isRtl,
    onOpen,
    onChangeGoIcon
}) => {
    const [goIcon, setGoIcon] = useState(() => {
        try {
            return localStorage.getItem(GO_ICON_KEY) || GO_ICON_PLAY;
        } catch (e) {
            return GO_ICON_PLAY;
        }
    });

    useEffect(() => {
        applyGoIcon(goIcon);

        try {
            localStorage.setItem(GO_ICON_KEY, goIcon);
        } catch (e) {
            // Ignore
        }
    }, [goIcon]);

    const changeGoIcon = mode => {
        setGoIcon(mode);
        onChangeGoIcon();
    };

    return (
        <MenuItem expanded={isOpen}>
            <div
                className={styles.option}
                onClick={onOpen}
            >
                <GoIcon id={goIcon} />

                <span className={styles.submenuLabel}>
                    <FormattedMessage
                        defaultMessage="Go Icon"
                        description="Label for Go Icon menu"
                        id="cattymod.menuBar.goIcon"
                    />
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
                    id={GO_ICON_PLAY}
                    isSelected={goIcon === GO_ICON_PLAY}
                    onClick={() => changeGoIcon(GO_ICON_PLAY)}
                />

                <GoIconMenuItem
                    id={GO_ICON_GREEN_FLAG}
                    isSelected={goIcon === GO_ICON_GREEN_FLAG}
                    onClick={() => changeGoIcon(GO_ICON_GREEN_FLAG)}
                />
            </Submenu>
        </MenuItem>
    );
};

GoIconMenu.propTypes = {
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onOpen: PropTypes.func,
    onChangeGoIcon: PropTypes.func
};

const mapStateToProps = state => ({
    isOpen: goIconMenuOpen(state),
    isRtl: state.locales.isRtl
});

const mapDispatchToProps = dispatch => ({
    onOpen: () => dispatch(openGoIconMenu()),
    onChangeGoIcon: () => dispatch(closeSettingsMenu())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GoIconMenu);
