
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';
import rainbowIcon from './tw-accent-rainbow.svg';

import {MenuItem, Submenu} from '../menu/menu.jsx';

import {ACCENT_MAP} from '../../lib/themes/index.js';

import {
    openAccentMenu,
    accentMenuOpen,
    closeSettingsMenu
} from '../../reducers/menus.js';

import {setTheme} from '../../reducers/theme.js';
import {persistTheme} from '../../lib/themes/themePersistance.js';

import styles from './settings-menu.css';

// All available accents, in display order
const ACCENT_ORDER = [
    'red',
    'orange',
    'yellow',
    'green',
    'blue',
    'indigo',
    'violet',
    'purple',
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
    'pink',
    'sky',
    'sunset',
    'trans',
    'vaporwave',
    'metal'
];

// Display names
const ACCENT_NAMES = {
    red: 'Red',
    orange: 'Orange',
    yellow: 'Yellow',
    green: 'Green',
    blue: 'Blue',
    indigo: 'Indigo',
    violet: 'Violet',
    purple: 'Purple',
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

// Generate localization descriptors
const getAccentMessage = id => {
    const name = ACCENT_NAMES[id] || id;

    return {
        defaultMessage: name,
        description: `${name} accent theme`,
        id: id === 'metal'
            ? 'tw.accent.metal'
            : `tw.accent.${id}`
    };
};

// Special icons
const icons = {
    rainbow: rainbowIcon
};

// Accent color icon
const ColorIcon = ({id}) => {
    const accent = ACCENT_MAP[id];

    const guiColors = accent && accent.guiColors
        ? accent.guiColors
        : {};

    const color = guiColors['looks-secondary'] || '#999';

    const backgroundImage =
        guiColors['menu-bar-background-image'];

    return icons[id] ? (
        <img
            className={styles.accentIconOuter}
            src={icons[id]}
            draggable={false}
            alt=""
        />
    ) : (
        <div
            className={styles.accentIconOuter}
            style={{
                backgroundColor: color,
                backgroundImage: backgroundImage || 'none'
            }}
        />
    );
};

ColorIcon.propTypes = {
    id: PropTypes.string.isRequired
};

// Individual accent menu item
const AccentMenuItem = ({
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

            <ColorIcon id={id} />

            <span className={styles.accentName}>
                <FormattedMessage {...getAccentMessage(id)} />
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

            <Submenu place={isRtl ? 'left' : 'right'}>
                <div className={styles.accentGrid}>
                    {availableAccents.map(id => (
                        <AccentMenuItem
                            key={id}
                            id={id}
                            isSelected={theme.accent === id}
                            onClick={() => {
                                onChangeTheme(
                                    theme.set('accent', id)
                                );
                            }}
                        />
                    ))}
                </div>
            </Submenu>
        </MenuItem>
    );
};

AccentThemeMenu.propTypes = {
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onChangeTheme: PropTypes.func,
    onOpen: PropTypes.func,
    theme: PropTypes.object
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
