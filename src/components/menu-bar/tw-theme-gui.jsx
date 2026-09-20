import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';

import {MenuItem, Submenu} from '../menu/menu.jsx';

import {
    GUI_DARK,
    GUI_LIGHT,
    GUI_MIDNIGHT,
    Theme
} from '../../lib/themes/index.js';

import {
    openThemeMenu,
    themeMenuOpen,
    closeSettingsMenu
} from '../../reducers/menus.js';

import {setTheme} from '../../reducers/theme.js';
import {persistTheme} from '../../lib/themes/themePersistance.js';

import styles from './settings-menu.css';


// 🎨 Theme preview colors
const THEME_PREVIEWS = {
    [GUI_LIGHT]: {
        backgroundColor: '#ffffff',
        backgroundImage: 'linear-gradient(135deg, #ffffff 50%, #eeeeee 50%)'
    },

    [GUI_DARK]: {
        backgroundColor: '#4c4c4c',
        backgroundImage: 'linear-gradient(135deg, #4c4c4c 50%, #333333 50%)'
    },

    [GUI_MIDNIGHT]: {
        backgroundColor: '#181a24',
        backgroundImage: 'linear-gradient(135deg, #181a24 50%, #101116 50%)'
    }
};


// 🎨 Theme icon
const ThemeIcon = props => {
    const preview = THEME_PREVIEWS[props.id];

    if (!preview) {
        return null;
    }

    return (
        <div
            className={styles.accentIconOuter}
            style={{
                backgroundColor: preview.backgroundColor,
                backgroundImage: preview.backgroundImage
            }}
        />
    );
};

ThemeIcon.propTypes = {
    id: PropTypes.string
};


// 🧩 Menu item
const ThemeMenuItem = props => (
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

            <ThemeIcon id={props.themeType}/>

            <span>{props.label}</span>
        </div>
    </MenuItem>
);

ThemeMenuItem.propTypes = {
    isSelected: PropTypes.bool,
    label: PropTypes.string,
    onClick: PropTypes.func,
    themeType: PropTypes.string
};


// 📌 Main menu
const GuiThemeMenu = ({
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
            <ThemeIcon id={theme.gui}/>

            <span className={styles.submenuLabel}>
                <FormattedMessage
                    defaultMessage="Theme"
                    description="Menu item for choosing the GUI theme"
                    id="tw.theme"
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
            <ThemeMenuItem
                label="Light"
                themeType={GUI_LIGHT}
                isSelected={theme.gui === GUI_LIGHT}
                onClick={() => onChangeTheme(
                    theme.set('gui', GUI_LIGHT)
                )}
            />

            <ThemeMenuItem
                label="Dark"
                themeType={GUI_DARK}
                isSelected={theme.gui === GUI_DARK}
                onClick={() => onChangeTheme(
                    theme.set('gui', GUI_DARK)
                )}
            />

            <ThemeMenuItem
                label="Midnight"
                themeType={GUI_MIDNIGHT}
                isSelected={theme.gui === GUI_MIDNIGHT}
                onClick={() => onChangeTheme(
                    theme.set('gui', GUI_MIDNIGHT)
                )}
            />
        </Submenu>
    </MenuItem>
);

GuiThemeMenu.propTypes = {
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onChangeTheme: PropTypes.func,
    onOpen: PropTypes.func,
    theme: PropTypes.instanceOf(Theme)
};


// Redux
const mapStateToProps = state => ({
    isOpen: themeMenuOpen(state),
    isRtl: state.locales.isRtl,
    theme: state.scratchGui.theme.theme
});

const mapDispatchToProps = dispatch => ({
    onChangeTheme: theme => {
        dispatch(setTheme(theme));
        dispatch(closeSettingsMenu());
        persistTheme(theme);
    },

    onOpen: () => dispatch(openThemeMenu())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(GuiThemeMenu);
