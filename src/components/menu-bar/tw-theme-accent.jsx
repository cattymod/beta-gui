import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';
import rainbowIcon from './tw-accent-rainbow.svg';

import {MenuItem, Submenu} from '../menu/menu.jsx';

import {
    ACCENT_MAP,
    Theme
} from '../../lib/themes/index.js';

import {
    openAccentMenu,
    accentMenuOpen,
    closeSettingsMenu
} from '../../reducers/menus.js';

import {setTheme} from '../../reducers/theme.js';
import {persistTheme} from '../../lib/themes/themePersistance.js';

import styles from './settings-menu.css';

// Accent order
const ACCENT_ORDER = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet',
    'purple',
    'pink',
    'rainbow',

    'ace',
    'aurora',
    'bi',
    'cherry',
    'coral',
    'cosmic',
    'fire',
    'forest',
    'gay',
    'honey',
    'lavender',
    'lesbian',
    'matrix',
    'mint',
    'nebula',
    'nonbinary',
    'ocean',
    'pan',
    'sky',
    'sunset',
    'trans',
    'vaporwave',
    'metal'
];

// Accent names
const ACCENT_NAMES = {
    red: 'Red',
    orange: 'Orange',
    yellow: 'Yellow',
    green: 'Green',
    blue: 'Blue',
    indigo: 'Indigo',
    violet: 'Violet',
    purple: 'Purple',
    mist: 'Pink',
    rainbow: 'Rainbow',

    ace: 'Ace',
    aurora: 'Aurora',
    bi: 'Bi',
    cherry: 'Cherry',
    coral: 'Coral',
    cosmic: 'Cosmic',
    fire: 'Fire',
    forest: 'Forest',
    gay: 'Gay',
    honey: 'Honey',
    lavender: 'Lavender',
    lesbian: 'Lesbian',
    matrix: 'Matrix',
    mint: 'Mint',
    nebula: 'Nebula',
    nonbinary: 'Nonbinary',
    ocean: 'Ocean',
    pan: 'Pan',
    pink: 'Pink',
    sky: 'Sky',
    sunset: 'Sunset',
    trans: 'Trans',
    vaporwave: 'Vaporwave',
    metal: 'Metal'
};

// Rainbow icon
const icons = {
    rainbow: rainbowIcon
};

// Color preview
const ColorIcon = ({id}) => {
    const accent = ACCENT_MAP[id];

    if (!accent) {
        return (
            <div
                className={styles.accentIconOuter}
                style={{backgroundColor: '#999'}}
            />
        );
    }

    if (icons[id]) {
        return (
            <img
                className={styles.accentIconOuter}
                src={icons[id]}
                draggable={false}
                alt=""
            />
        );
    }

    return (
        <div
            className={styles.accentIconOuter}
            style={{
                backgroundColor:
                    accent.guiColors['looks-secondary'] || '#999',
                backgroundImage:
                    accent.guiColors['menu-bar-background-image'] || 'none'
            }}
        />
    );
};

ColorIcon.propTypes = {
    id: PropTypes.string.isRequired
};

// Individual accent item
const AccentMenuItem = ({
    id,
    isSelected,
    onClick
}) => (
    <MenuItem onClick={onClick}>
    <div className={styles.option}>
        <div
            className={classNames(styles.checkCircle, {
                [styles.selected]: isSelected
            })}
        >
            <img
    className={styles.check}
    src={check}
    draggable={false}
    alt=""
    style={{filter: 'brightness(0)'}}
/>
        </div>

            <ColorIcon id={id} />

            <span
    className={styles.accentLabel}
    style={{color: '#fff'}}
>
    {ACCENT_NAMES[id] || id}
</span>
        </div>
    </MenuItem>
);

AccentMenuItem.propTypes = {
    id: PropTypes.string.isRequired,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func.isRequired
};

// Main accent menu
const AccentThemeMenu = ({
    isOpen,
    isRtl,
    onChangeTheme,
    onOpen,
    theme
}) => {
    const availableAccents = ACCENT_ORDER.filter(
        id => Object.prototype.hasOwnProperty.call(ACCENT_MAP, id)
    );

    return (
        <MenuItem expanded={isOpen}>
            <div
                className={styles.option}
                onClick={onOpen}
            >
                <ColorIcon id={theme.accent} />

                <span className={styles.submenuLabel}>
                    <FormattedMessage
                        defaultMessage="Accent"
                        description="Label for accent theme menu"
                        id="tw.menuBar.accent"
                    />
                </span>

                <img
                    className={styles.expandCaret}
                    src={dropdownCaret}
                    draggable={false}
                    alt=""
                />
            </div>

            <Submenu
                place={isRtl ? 'left' : 'right'}
                className={styles.accentSubmenu}
            >
                {availableAccents.map(id => (
                    <AccentMenuItem
                        key={id}
                        id={id}
                        isSelected={theme.accent === id}
                        onClick={() => onChangeTheme(theme.set('accent', id))}
                    />
                ))}
            </Submenu>
        </MenuItem>
    );
};

AccentThemeMenu.propTypes = {
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onChangeTheme: PropTypes.func,
    onOpen: PropTypes.func,
    theme: PropTypes.instanceOf(Theme)
};

// Redux
const mapStateToProps = state => ({
    isOpen: accentMenuOpen(state),
    isRtl: state.locales.isRtl,
    theme: state.scratchGui.theme.theme
});

const mapDispatchToProps = dispatch => ({
    onChangeTheme: theme => {
        dispatch(setTheme(theme));
        dispatch(closeSettingsMenu());
        persistTheme(theme);
    },

    onOpen: () => dispatch(openAccentMenu())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(AccentThemeMenu);
