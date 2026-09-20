import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {connect} from 'react-redux';

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

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';

const ThemeIcon = ({theme}) => {
    if (theme === GUI_LIGHT) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.themeIcon}
                aria-hidden="true"
            >
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2"/>
                <path d="M12 20v2"/>
                <path d="m4.93 4.93 1.41 1.41"/>
                <path d="m17.66 17.66 1.41 1.41"/>
                <path d="M2 12h2"/>
                <path d="M20 12h2"/>
                <path d="m6.34 17.66-1.41 1.41"/>
                <path d="m19.07 4.93-1.41 1.41"/>
            </svg>
        );
    }

    if (theme === GUI_DARK) {
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={styles.themeIcon}
                aria-hidden="true"
            >
                <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
            </svg>
        );
    }

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={styles.themeIcon}
            aria-hidden="true"
        >
            <path d="M18 5h4"/>
            <path d="M20 3v4"/>
            <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
        </svg>
    );
};

ThemeIcon.propTypes = {
    theme: PropTypes.string
};

const ThemeMenuItem = ({
    label,
    themeType,
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

            <ThemeIcon theme={themeType}/>

            <span>{label}</span>
        </div>
    </MenuItem>
);

ThemeMenuItem.propTypes = {
    isSelected: PropTypes.bool,
    label: PropTypes.string,
    onClick: PropTypes.func,
    themeType: PropTypes.string
};

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
            // eslint-disable-next-line react/jsx-no-bind
            onClick={onOpen}
        >
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
