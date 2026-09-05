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

import {
    GO_ICON_PLAY,
    GO_ICON_GREEN_FLAG,
    GO_ICON_BLUE_FLAG,
    GO_ICON_PURPLE_FLAG,
    getGoIcon,
    getGoIconImage,
    setGoIcon,
    applyGoIcon
} from '../../lib/go-icon';

import menuBarStyles from './menu-bar.css';
import styles from './settings-menu.css';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';
import settingsIcon from './icon--settings.svg';

const isFileProtocol = () =>
    typeof window !== 'undefined' &&
    window.location.protocol === 'file:';

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
}) => {
    if (isFileProtocol()) {
        return null;
    }

    return (
        <MenuItem expanded={isOpen}>
            <div
                className={styles.option}
                onClick={onOpen}
            >
                <GoIconPreview
                    icon={getGoIconImage(goIcon)}
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
                    icon={getGoIconImage(GO_ICON_PLAY)}
                    label="Play Button (default)"
                    isSelected={goIcon === GO_ICON_PLAY}
                    onClick={() => onChangeGoIcon(GO_ICON_PLAY)}
                />

                <GoIconMenuItem
                    icon={getGoIconImage(GO_ICON_GREEN_FLAG)}
                    label="Green Flag"
                    isSelected={goIcon === GO_ICON_GREEN_FLAG}
                    onClick={() => onChangeGoIcon(GO_ICON_GREEN_FLAG)}
                />

                <GoIconMenuItem
                    icon={getGoIconImage(GO_ICON_BLUE_FLAG)}
                    label="Blue Flag"
                    isSelected={goIcon === GO_ICON_BLUE_FLAG}
                    onClick={() => onChangeGoIcon(GO_ICON_BLUE_FLAG)}
                />

                <GoIconMenuItem
                    icon={getGoIconImage(GO_ICON_PURPLE_FLAG)}
                    label="Purple Flag"
                    isSelected={goIcon === GO_ICON_PURPLE_FLAG}
                    onClick={() => onChangeGoIcon(GO_ICON_PURPLE_FLAG)}
                />
            </Submenu>
        </MenuItem>
    );
};

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
    const [goIcon, setGoIconState] = useState(() =>
        isFileProtocol() ? GO_ICON_PLAY : getGoIcon()
    );

    const [goIconMenuOpen, setGoIconMenuOpen] = useState(false);

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
        if (isFileProtocol()) {
            setGoIconMenuOpen(false);
            return undefined;
        }

        applyGoIcon(goIcon);

        return undefined;
    }, [goIcon]);

    function onChangeGoIcon(mode) {
        if (isFileProtocol()) {
            return;
        }

        if (
            mode !== GO_ICON_PLAY &&
            mode !== GO_ICON_GREEN_FLAG &&
            mode !== GO_ICON_BLUE_FLAG &&
            mode !== GO_ICON_PURPLE_FLAG
        ) {
            return;
        }

        setGoIcon(mode);
        setGoIconState(mode);
        applyGoIcon(mode);

        setGoIconMenuOpen(false);
        onRequestClose();
    }

    function onOpenGoIconMenu() {
        if (isFileProtocol()) {
            return;
        }

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

                    {!isFileProtocol() && (
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
