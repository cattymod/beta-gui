import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, defineMessages} from 'react-intl';
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


// 🌈 Labels (safe + extendable)
const ACCENT_LABELS = {
    red: {
        defaultMessage: 'Red',
        description: 'Red accent theme',
        id: 'tw.accent.red'
    },
    orange: {
        defaultMessage: 'Orange',
        description: 'Orange accent theme',
        id: 'tw.accent.orange'
    },
    yellow: {
        defaultMessage: 'Yellow',
        description: 'Yellow accent theme',
        id: 'tw.accent.yellow'
    },
    green: {
        defaultMessage: 'Green',
        description: 'Green accent theme',
        id: 'tw.accent.green'
    },
    blue: {
        defaultMessage: 'Blue',
        description: 'Blue accent theme',
        id: 'tw.accent.blue'
    },
    indigo: {
        defaultMessage: 'Indigo',
        description: 'Indigo accent theme',
        id: 'tw.accent.indigo'
    },
    violet: {
        defaultMessage: 'Violet',
        description: 'Violet accent theme',
        id: 'tw.accent.violet'
    },
    purple: {
        defaultMessage: 'Purple',
        description: 'Purple accent theme',
        id: 'tw.accent.purple'
    },
    rainbow: {
        defaultMessage: 'Rainbow',
        description: 'Rainbow accent theme',
        id: 'tw.accent.rainbow'
    }
};


// Icons (optional overrides)
const icons = {
    rainbow: rainbowIcon
};


// 🎨 Color icon renderer
const ColorIcon = props => (
    icons[props.id] ? (
        <img
            className={styles.accentIconOuter}
            src={icons[props.id]}
            draggable={false}
            alt=""
        />
    ) : (
        <div
            className={styles.accentIconOuter}
            style={{
                backgroundColor:
                    ACCENT_MAP[props.id]?.guiColors?.['looks-secondary'] || '#999',
                backgroundImage:
                    ACCENT_MAP[props.id]?.guiColors?.['menu-bar-background-image']
            }}
        />
    )
);

ColorIcon.propTypes = {
    id: PropTypes.string
};


// 🧩 Menu item
const AccentMenuItem = props => (
    <MenuItem onClick={props.onClick}>
        <div className={styles.option}>
            <img
                className={classNames(styles.check, {
                    [styles.selected]: props.isSelected
                })}
                width={15}
                height={12}
                src={check}
                draggable={false}
                alt=""
            />

            <ColorIcon id={props.id} />

            <FormattedMessage {...ACCENT_LABELS[props.id]} />
        </div>
    </MenuItem>
);

AccentMenuItem.propTypes = {
    id: PropTypes.string,
    isSelected: PropTypes.bool,
    onClick: PropTypes.func
};


// 📌 Main menu
const AccentThemeMenu = ({
    isOpen,
    isRtl,
    onChangeTheme,
    onOpen,
    theme
}) => (
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
            {Object.keys(ACCENT_MAP).map(item => (
                <AccentMenuItem
                    key={item}
                    id={item}
                    isSelected={theme.accent === item}
                    onClick={() =>
                        onChangeTheme(theme.set('accent', item))
                    }
                />
            ))}
        </Submenu>
    </MenuItem>
);


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
