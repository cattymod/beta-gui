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

const ThemeMenuItem = ({
    label,
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

            <span>{label}</span>
        </div>
    </MenuItem>
);

ThemeMenuItem.propTypes = {
    isSelected: PropTypes.bool,
    label: PropTypes.string,
    onClick: PropTypes.func
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
                isSelected={theme.gui === GUI_LIGHT}
                onClick={() => onChangeTheme(
                    theme.set('gui', GUI_LIGHT)
                )}
            />

            <ThemeMenuItem
                label="Dark"
                isSelected={theme.gui === GUI_DARK}
                onClick={() => onChangeTheme(
                    theme.set('gui', GUI_DARK)
                )}
            />

            <ThemeMenuItem
                label="Midnight"
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
