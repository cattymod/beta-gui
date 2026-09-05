import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {FormattedMessage} from 'react-intl';

import LanguageMenu from './language-menu.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import {MenuSection, MenuItem} from '../menu/menu.jsx';
import MenuLabel from './tw-menu-label.jsx';
import TWAccentThemeMenu from './tw-theme-accent.jsx';
import TWGuiThemeMenu from './tw-theme-gui.jsx';
import TWBlocksThemeMenu from './tw-theme-blocks.jsx';
import TWDesktopSettings from './tw-desktop-settings.jsx';
import TWGoIcon from './tw-go-icon.jsx';

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

import dropdownCaret from './dropdown-caret.svg';
import settingsIcon from './icon--settings.svg';

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
}) => (
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

                <TWGoIcon
                    isOpen={settingsMenuOpen}
                    isRtl={isRtl}
                    onRequestClose={onRequestClose}
                    onCloseOtherMenus={() => {
                        if (accentIsOpen) {
                            closeAccentMenu();
                        }

                        if (blocksThemeIsOpen) {
                            closeBlocksThemeMenu();
                        }

                        if (languageIsOpen) {
                            closeLanguageMenu();
                        }
                    }}
                />

                {onClickDesktopSettings && (
                    <TWDesktopSettings
                        onClick={onClickDesktopSettings}
                    />
                )}

                <div className={styles.settingsSeparator} />

                <MenuItem>
                    <div
                        className={styles.option}
                        // eslint-disable-next-line react/jsx-no-bind
                        onClick={() => {
                            window.open(
                                'https://studio.cattymod.app/settings',
                                '_blank',
                                'noopener,noreferrer'
                            );
                            onRequestClose();
                        }}
                    >
                        <img
                            src={settingsIcon}
                            draggable={false}
                            width={24}
                            height={24}
                            alt=""
                        />

                        <span className={styles.submenuLabel}>
                            <FormattedMessage
                                defaultMessage="More Settings"
                                description="Menu item to open more settings"
                                id="tw.moreSettings"
                            />
                        </span>
                    </div>
                </MenuItem>
            </MenuSection>
        </MenuBarMenu>
    </MenuLabel>
);

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
