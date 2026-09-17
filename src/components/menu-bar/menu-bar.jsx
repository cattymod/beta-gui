import classNames from 'classnames';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {defineMessages, FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import bowser from 'bowser';
import React from 'react';

import VM from 'scratch-vm';

import Box from '../box/box.jsx';
import Button from '../button/button.jsx';
import CommunityButton from './community-button.jsx';
import ShareButton from './share-button.jsx';
import {ComingSoonTooltip} from '../coming-soon/coming-soon.jsx';
import Divider from '../divider/divider.jsx';
import SaveStatus from './save-status.jsx';
import ProjectWatcher from '../../containers/project-watcher.jsx';
import MenuBarMenu from './menu-bar-menu.jsx';
import MenuLabel from './tw-menu-label.jsx';
import {MenuItem, MenuSection} from '../menu/menu.jsx';
import ProjectTitleInput from './project-title-input.jsx';
import AuthorInfo from './author-info.jsx';
import SB3Downloader from '../../containers/sb3-downloader.jsx';
import DeletionRestorer from '../../containers/deletion-restorer.jsx';
import TurboMode from '../../containers/turbo-mode.jsx';
import MenuBarHOC from '../../containers/menu-bar-hoc.jsx';
import SettingsMenu from './settings-menu.jsx';

import FramerateChanger from '../../containers/tw-framerate-changer.jsx';
import ChangeUsername from '../../containers/tw-change-username.jsx';
import CloudVariablesToggler from '../../containers/tw-cloud-toggler.jsx';
import TWSaveStatus from './tw-save-status.jsx';
import TWNews from './tw-news.jsx';
import {
    getCustomDefaultProject,
    onNewClick
} from '../../lib/customDefaultProject.js';

import {openTipsLibrary, openSettingsModal, openRestorePointModal} from '../../reducers/modals';
import {setPlayer} from '../../reducers/mode';
import {
    isTimeTravel220022BC,
    isTimeTravel1920,
    isTimeTravel1990,
    isTimeTravel2020,
    isTimeTravelNow,
    setTimeTravel
} from '../../reducers/time-travel';
import {
    autoUpdateProject,
    getIsUpdating,
    getIsShowingProject,
    manualUpdateProject,
    requestNewProject,
    remixProject,
    saveProjectAsCopy
} from '../../reducers/project-state';
import {
    openAboutMenu,
    closeAboutMenu,
    aboutMenuOpen,
    openAccountMenu,
    closeAccountMenu,
    accountMenuOpen,
    openFileMenu,
    closeFileMenu,
    fileMenuOpen,
    openEditMenu,
    closeEditMenu,
    editMenuOpen,
    openLoginMenu,
    closeLoginMenu,
    loginMenuOpen,
    openModeMenu,
    closeModeMenu,
    modeMenuOpen,
    settingsMenuOpen,
    openSettingsMenu,
    closeSettingsMenu,
    errorsMenuOpen,
    openErrorsMenu,
    closeErrorsMenu
} from '../../reducers/menus';
import {setFileHandle} from '../../reducers/tw.js';

import collectMetadata from '../../lib/collect-metadata';

import styles from './menu-bar.css';

import helpIcon from '../../lib/assets/icon--tutorials.svg';
import mystuffIcon from './icon--mystuff.png';
import profileIcon from './icon--profile.png';
import remixIcon from './icon--remix.svg';
import dropdownCaret from './dropdown-caret.svg';
import aboutIcon from './icon--about.svg';
import fileIcon from './icon--file.svg';
import editIcon from './icon--edit.svg';
import addonsIcon from './addons.svg';
import errorIcon from './tw-error.svg';
import advancedIcon from './tw-advanced.svg';

import ninetiesLogo from './nineties_logo.svg';
import catLogo from './cat_logo.svg';
import prehistoricLogo from './prehistoric-logo.svg';
import oldtimeyLogo from './oldtimey-logo.svg';

import sharedMessages from '../../lib/shared-messages';

import SeeInsideButton from './tw-see-inside.jsx';
import {notScratchDesktop} from '../../lib/isScratchDesktop.js';
import {APP_NAME} from '../../lib/brand.js';

const ariaMessages = defineMessages({
    tutorials: {
        id: 'gui.menuBar.tutorialsLibrary',
        defaultMessage: 'Tutorials',
        description: 'accessibility text for the tutorials button'
    }
});

const twMessages = defineMessages({
    compileError: {
        id: 'tw.menuBar.compileError',
        defaultMessage: '{sprite}: {error}',
        description: 'Error message in error menu'
    }
});

const MenuBarItemTooltip = ({
    children,
    className,
    enable,
    id,
    place = 'bottom'
}) => {
    if (enable) {
        return (
            <React.Fragment>
                {children}
            </React.Fragment>
        );
    }
    return (
        <ComingSoonTooltip
            className={classNames(styles.comingSoon, className)}
            place={place}
            tooltipClassName={styles.comingSoonTooltip}
            tooltipId={id}
        >
            {children}
        </ComingSoonTooltip>
    );
};

MenuBarItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    enable: PropTypes.bool,
    id: PropTypes.string,
    place: PropTypes.oneOf(['top', 'bottom', 'left', 'right'])
};

const MenuItemTooltip = ({id, isRtl, children, className}) => (
    <ComingSoonTooltip
        className={classNames(styles.comingSoon, className)}
        isRtl={isRtl}
        place={isRtl ? 'left' : 'right'}
        tooltipClassName={styles.comingSoonTooltip}
        tooltipId={id}
    >
        {children}
    </ComingSoonTooltip>
);

MenuItemTooltip.propTypes = {
    children: PropTypes.node,
    className: PropTypes.string,
    id: PropTypes.string,
    isRtl: PropTypes.bool
};

const AboutButton = props => (
    <Button
        className={classNames(styles.menuBarItem, styles.hoverable)}
        iconClassName={styles.aboutIcon}
        iconSrc={aboutIcon}
        onClick={props.onClick}
    />
);

AboutButton.propTypes = {
    onClick: PropTypes.func.isRequired
};

// Unlike <MenuItem href="">, this uses an actual <a>
const MenuItemLink = props => (
    <a
        href={props.href}
        rel="noreferrer"
        target="_blank"
        className={styles.menuItemLink}
    >
        <MenuItem>{props.children}</MenuItem>
    </a>
);

MenuItemLink.propTypes = {
    children: PropTypes.node.isRequired,
    href: PropTypes.string.isRequired
};

class MenuBar extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClickSeeInside',
            'handleClickNew',
            'handleClickNewWindow',
            'handleClickNewTab',
            'handleClickRemix',
            'handleClickSave',
            'handleClickSaveAsCopy',
            'handleClickPackager',
            'handleClickDesktopSettings',
            'handleClickRestorePoints',
            'handleClickSeeCommunity',
            'handleClickShare',
            'handleSetMode',
            'handleKeyPress',
            'handleRestoreOption',
            'getSaveToComputerHandler',
            'restoreOptionMessage',
            'handleClickGoHome'
        ]);
    }

    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
    }

    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    handleClickNew () {
        const readyToReplaceProject =
            this.props.confirmReadyToReplaceProject(
                this.props.intl.formatMessage(
                    sharedMessages.replaceProjectWarning
                )
            );

        this.props.onRequestCloseFile();

        if (readyToReplaceProject) {
            this.props.onClickNew(
                this.props.canSave &&
                this.props.canCreateNew
            );
        }

        this.props.onRequestCloseFile();

        if (getCustomDefaultProject()) {
            onNewClick()
                .catch(e => {
                    console.error(
                        '❌ Failed to load custom default project:',
                        e
                    );
                });
        }
    }

    handleClickNewWindow () {
        this.props.onClickNewWindow();
        this.props.onRequestCloseFile();
    }

    handleClickNewTab () {
        window.location.href = '/tabs';
        window.dispatchEvent(new PopStateEvent('popstate'));
        this.props.onRequestCloseFile();
    }

    handleClickRemix () {
        this.props.onClickRemix();
        this.props.onRequestCloseFile();
    }

    handleClickSave () {
        this.props.onClickSave();
        this.props.onRequestCloseFile();
    }

    handleClickSaveAsCopy () {
        this.props.onClickSaveAsCopy();
        this.props.onRequestCloseFile();
    }

    handleClickPackager () {
        this.props.onClickPackager();
        this.props.onRequestCloseFile();
    }

    handleClickDesktopSettings () {
        this.props.onClickDesktopSettings();
        this.props.onRequestCloseSettings();
    }

    handleClickRestorePoints () {
    this.props.onClickRestorePoints();
    this.props.onRequestCloseFile();
}

    handleClickGoHome () {
        window.location.href = 'https://cattymod.app';
    }

    handleClickSeeCommunity (waitForUpdate) {
        if (this.props.shouldSaveBeforeTransition()) {
            this.props.autoUpdateProject();
            waitForUpdate(true);
        } else {
            waitForUpdate(false);
        }
    }

    handleClickShare (waitForUpdate) {
        if (!this.props.isShared) {
            if (this.props.canShare) {
                this.props.onShare();
            }
            if (this.props.canSave) {
                this.props.autoUpdateProject();
                waitForUpdate(true);
            } else {
                waitForUpdate(false);
            }
        }
    }

    handleSetMode (mode) {
        return () => {
            if (mode === '1920') {
                document.documentElement.style.filter = 'brightness(.9)contrast(.8)sepia(1.0)';
                document.documentElement.style.height = '100%';
            } else if (mode === '1990') {
                document.documentElement.style.filter = 'hue-rotate(40deg)';
                document.documentElement.style.height = '100%';
            } else {
                document.documentElement.style.filter = '';
                document.documentElement.style.height = '';
            }

            if (mode === '1990') {
                document.getElementById('logo_img').src = ninetiesLogo;
            } else if (mode === '2020') {
                document.getElementById('logo_img').src = catLogo;
            } else if (mode === '1920') {
                document.getElementById('logo_img').src = oldtimeyLogo;
            } else if (mode === '220022BC') {
                document.getElementById('logo_img').src = prehistoricLogo;
            } else {
                document.getElementById('logo_img').src = this.props.logo;
            }

            this.props.onSetTimeTravelMode(mode);
        };
    }

    handleRestoreOption (restoreFun) {
        return () => {
            restoreFun();
            this.props.onRequestCloseEdit();
        };
    }

    handleKeyPress (event) {
        const modifier = bowser.mac ? event.metaKey : event.ctrlKey;

        if (modifier) {
            if (event.key.toLowerCase() === 's') {
                this.props.handleSaveProject();
                event.preventDefault();
            } else if (event.key.toLowerCase() === 'o') {
                event.preventDefault();
                this.props.onStartSelectingFileUpload();
            }
        }
    }

    getSaveToComputerHandler (downloadProjectCallback) {
        return () => {
            this.props.onRequestCloseFile();
            downloadProjectCallback();

            if (this.props.onProjectTelemetryEvent) {
                const metadata = collectMetadata(
                    this.props.vm,
                    this.props.projectTitle,
                    this.props.locale
                );
                this.props.onProjectTelemetryEvent(
                    'projectDidSave',
                    metadata
                );
            }
        };
    }

    restoreOptionMessage (deletedItem) {
        switch (deletedItem) {
        case 'Sprite':
            return (
                <FormattedMessage
                    defaultMessage="Restore Sprite"
                    description="Menu bar item for restoring the last deleted sprite."
                    id="gui.menuBar.restoreSprite"
                />
            );
        case 'Sound':
            return (
                <FormattedMessage
                    defaultMessage="Restore Sound"
                    description="Menu bar item for restoring the last deleted sound."
                    id="gui.menuBar.restoreSound"
                />
            );
        case 'Costume':
            return (
                <FormattedMessage
                    defaultMessage="Restore Costume"
                    description="Menu bar item for restoring the last deleted costume."
                    id="gui.menuBar.restoreCostume"
                />
            );
        default:
            return (
                <FormattedMessage
                    defaultMessage="Restore"
                    description="Menu bar item for restoring the last deleted item in its disabled state."
                    id="gui.menuBar.restore"
                />
            );
        }
    }

    handleClickSeeInside () {
        this.props.onClickSeeInside();

        if (window.location.pathname !== '/editor') {
            window.history.pushState(
                {},
                '',
                `/editor${window.location.search}${window.location.hash}`
            );
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    }

    buildAboutMenu (onClickAbout) {
        if (!onClickAbout) {
            return null;
        }

        if (typeof onClickAbout === 'function') {
            return <AboutButton onClick={onClickAbout} />;
        }

        return (
            <MenuLabel
                open={this.props.aboutMenuOpen}
                onOpen={this.props.onRequestOpenAbout}
                onClose={this.props.onRequestCloseAbout}
            >
                <img
                    className={styles.aboutIcon}
                    src={aboutIcon}
                    draggable={false}
                />
                <MenuBarMenu
                    className={classNames(styles.menuBarMenu)}
                    open={this.props.aboutMenuOpen}
                    place={this.props.isRtl ? 'right' : 'left'}
                >
                    {onClickAbout.map(itemProps => (
                        <MenuItem
                            key={itemProps.title}
                            isRtl={this.props.isRtl}
                            onClick={this.wrapAboutMenuCallback(itemProps.onClick)}
                        >
                            {itemProps.title}
                        </MenuItem>
                    ))}
                </MenuBarMenu>
            </MenuLabel>
        );
    }

    wrapAboutMenuCallback (callback) {
        return () => {
            callback();
            this.props.onRequestCloseAbout();
        };
    }

    render () {
        const isEmbeddedEditor = window.parent !== window;

        const saveNowMessage = (
            <FormattedMessage
                defaultMessage="Save now"
                description="Menu bar item for saving now"
                id="gui.menuBar.saveNow"
            />
        );

        const createCopyMessage = (
            <FormattedMessage
                defaultMessage="Save as a copy"
                description="Menu bar item for saving as a copy"
                id="gui.menuBar.saveAsCopy"
            />
        );

        const remixMessage = (
            <FormattedMessage
                defaultMessage="Remix"
                description="Menu bar item for remixing"
                id="gui.menuBar.remix"
            />
        );

        const newProjectMessage = (
            <FormattedMessage
                defaultMessage="New"
                description="Menu bar item for creating a new project"
                id="gui.menuBar.new"
            />
        );

        const remixButton = (
            <Button
                className={classNames(
                    styles.menuBarButton,
                    styles.remixButton
                )}
                iconClassName={styles.remixButtonIcon}
                iconSrc={remixIcon}
                onClick={this.handleClickRemix}
            >
                {remixMessage}
            </Button>
        );

        const aboutButton = this.buildAboutMenu(this.props.onClickAbout);

        const menuBar = (
            <Box
                className={classNames(
                    this.props.className,
                    styles.menuBar
                )}
            >
                <div className={styles.mainMenu}>
                    <div className={styles.fileGroup}>

                        {this.props.errors.length > 0 && (
                            <div>
                                <MenuLabel
                                    open={this.props.errorsMenuOpen}
                                    onOpen={this.props.onClickErrors}
                                    onClose={this.props.onRequestCloseErrors}
                                >
                                    <img
                                        src={errorIcon}
                                        draggable={false}
                                        width={20}
                                        height={20}
                                    />
                                    <img
                                        src={dropdownCaret}
                                        draggable={false}
                                        width={8}
                                        height={5}
                                    />

                                    <MenuBarMenu
                                        className={classNames(styles.menuBarMenu)}
                                        open={this.props.errorsMenuOpen}
                                        place={this.props.isRtl ? 'left' : 'right'}
                                    >
                                        <MenuSection>
                                            <MenuItemLink href="https://scratch.mit.edu/projects/1335032585/">
                                                <FormattedMessage
                                                    defaultMessage="Some scripts encountered errors."
                                                    description="Link in error menu"
                                                    id="tw.menuBar.reportError1"
                                                />
                                            </MenuItemLink>

                                            <MenuItemLink href="https://scratch.mit.edu/projects/1335032585/">
                                                <FormattedMessage
                                                    defaultMessage="This is a bug. Please report it."
                                                    description="Link in error menu"
                                                    id="tw.menuBar.reportError2"
                                                />
                                            </MenuItemLink>
                                        </MenuSection>

                                        <MenuSection>
                                            {this.props.errors.map(({id, sprite, error}) => (
                                                <MenuItem key={id}>
                                                    {this.props.intl.formatMessage(
                                                        twMessages.compileError,
                                                        {
                                                            sprite,
                                                            error
                                                        }
                                                    )}
                                                </MenuItem>
                                            ))}
                                        </MenuSection>
                                    </MenuBarMenu>
                                </MenuLabel>
                            </div>
                        )}

                        {(this.props.canChangeTheme || this.props.canChangeLanguage) && (
                            <SettingsMenu
                                canChangeLanguage={this.props.canChangeLanguage}
                                canChangeTheme={this.props.canChangeTheme}
                                isRtl={this.props.isRtl}
                                onClickDesktopSettings={
                                    this.props.onClickDesktopSettings &&
                                    this.handleClickDesktopSettings
                                }
                                onOpenCustomSettings={
                                    this.props.onClickAddonSettings &&
                                    this.props.onClickAddonSettings.bind(
                                        null,
                                        'editor-theme3'
                                    )
                                }
                                onRequestClose={this.props.onRequestCloseSettings}
                                onRequestOpen={this.props.onClickSettings}
                                settingsMenuOpen={this.props.settingsMenuOpen}
                            />
                        )}

                        {this.props.canManageFiles && (
                            <MenuLabel
                                open={this.props.fileMenuOpen}
                                onOpen={this.props.onClickFile}
                                onClose={this.props.onRequestCloseFile}
                            >
                                <img
                                    src={fileIcon}
                                    draggable={false}
                                    width={20}
                                    height={20}
                                />

                                <span className={styles.collapsibleLabel}>
                                    <FormattedMessage
                                        defaultMessage="File"
                                        description="Text for file dropdown menu"
                                        id="gui.menuBar.file"
                                    />
                                </span>

                                <img
                                    src={dropdownCaret}
                                    draggable={false}
                                    width={8}
                                    height={5}
                                />

                                <MenuBarMenu
                                    className={classNames(styles.menuBarMenu)}
                                    open={this.props.fileMenuOpen}
                                    place={this.props.isRtl ? 'left' : 'right'}
                                >

                                    {/* New */}
                                    <MenuItem
                                        isRtl={this.props.isRtl}
                                        onClick={this.handleClickNew}
                                    >
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
                                        >
                                            <path d="M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35" />
                                            <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                            <path d="M14 19h6" />
                                            <path d="M17 16v6" />
                                        </svg>
                                        {newProjectMessage}
                                    </MenuItem>

                                    {this.props.onClickNewWindow && (
                                        <MenuItem
                                            isRtl={this.props.isRtl}
                                            onClick={this.handleClickNewWindow}
                                        >
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
                                            >
                                                <path d="M11.35 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.706.706l3.588 3.588A2.4 2.4 0 0 1 20 8v5.35" />
                                                <path d="M14 2v5a1 1 0 0 0 1 1h5" />
                                                <path d="M14 19h6" />
                                                <path d="M17 16v6" />
                                            </svg>

                                            <FormattedMessage
                                                defaultMessage="New window"
                                                description="Part of desktop app. Menu bar item that creates a new window."
                                                id="tw.menuBar.newWindow"
                                            />
                                        </MenuItem>
                                    )}

                                    {/* New Tab */}
                                    {!isEmbeddedEditor && (
                                        <MenuItem
                                            isRtl={this.props.isRtl}
                                            onClick={this.handleClickNewTab}
                                        >
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
                                            >
                                                <path d="M19 16v6" />
                                                <path d="M21 12.536V5" />
                                                <path d="M22 19h-6" />
                                                <path d="M3 12A9 3 0 0 0 15.1824 14.8061" />
                                                <path d="M3 5V19A9 3 0 0 0 13.318 21.968" />
                                                <ellipse cx="12" cy="5" rx="9" ry="3" />
                                            </svg>
                                            New Tab
                                        </MenuItem>
                                    )}

                                    {(this.props.canSave ||
                                        this.props.canCreateCopy ||
                                        this.props.canRemix) && (
                                        <MenuSection>

                                            {this.props.canSave && (
                                                <MenuItem onClick={this.handleClickSave}>
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
                                                    >
                                                        <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                                                        <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                                                        <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                                                    </svg>
                                                    {saveNowMessage}
                                                </MenuItem>
                                            )}

                                            {this.props.canCreateCopy && (
                                                <MenuItem onClick={this.handleClickSaveAsCopy}>
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
                                                    >
                                                        <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                                                        <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                                                        <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                                                    </svg>
                                                    {createCopyMessage}
                                                </MenuItem>
                                            )}

                                            {this.props.canRemix && (
                                                <MenuItem onClick={this.handleClickRemix}>
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
                                                    >
                                                        <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                                                        <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                                                        <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                                                    </svg>
                                                    {remixMessage}
                                                </MenuItem>
                                            )}

                                        </MenuSection>
                                    )}

                                    <MenuSection>

                                        {/* Load from computer */}
                                        <MenuItem
                                            onClick={this.props.onStartSelectingFileUpload}
                                        >
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
                                            >
                                                <path d="M12 3v12" />
                                                <path d="m17 8-5-5-5 5" />
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            </svg>

                                            {this.props.intl.formatMessage(
                                                sharedMessages.loadFromComputerTitle
                                            )}
                                        </MenuItem>

                                        <SB3Downloader
                                            showSaveFilePicker={this.props.showSaveFilePicker}
                                        >
                                            {(_className, downloadProject, extended) => (
                                                <React.Fragment>

                                                    {extended.available && (
                                                        <React.Fragment>

                                                            {extended.name !== null && (
                                                                <MenuItem
                                                                    onClick={this.getSaveToComputerHandler(
                                                                        extended.saveToLastFile
                                                                    )}
                                                                >
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
                                                                    >
                                                                        <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                                                                        <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                                                                        <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                                                                    </svg>

                                                                    <FormattedMessage
                                                                        defaultMessage="Save to {file}"
                                                                        description="Menu bar item to save project to an existing file on the user's computer"
                                                                        id="tw.saveTo"
                                                                        values={{
                                                                            file: extended.name
                                                                        }}
                                                                    />
                                                                </MenuItem>
                                                            )}

                                                            <MenuItem
                                                                onClick={this.getSaveToComputerHandler(
                                                                    extended.saveAsNew
                                                                )}
                                                            >
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
                                                                >
                                                                    <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                                                                    <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
                                                                    <path d="M7 3v4a1 1 0 0 0 1 1h7" />
                                                                </svg>

                                                                <FormattedMessage
                                                                    defaultMessage="Save as..."
                                                                    description="Menu bar item to select a new file to save the project as"
                                                                    id="tw.saveAs"
                                                                />
                                                            </MenuItem>

                                                        </React.Fragment>
                                                    )}

                                                    {notScratchDesktop() && (
                                                        <MenuItem
                                                            onClick={this.getSaveToComputerHandler(
                                                                downloadProject
                                                            )}
                                                        >
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
                                                            >
                                                                <path d="M12 15V3" />
                                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                                <path d="m7 10 5 5 5-5" />
                                                            </svg>

                                                            {extended.available ? (
                                                                <FormattedMessage
                                                                    defaultMessage="Save to separate file..."
                                                                    description="Download the project once, without being able to easily save to the same spot"
                                                                    id="tw.oldDownload"
                                                                />
                                                            ) : (
                                                                <FormattedMessage
                                                                    defaultMessage="Save to your computer"
                                                                    description="Menu bar item for downloading a project to your computer"
                                                                    id="gui.menuBar.downloadToComputer"
                                                                />
                                                            )}
                                                        </MenuItem>
                                                    )}

                                                </React.Fragment>
                                            )}
                                        </SB3Downloader>

                                    </MenuSection>

                                   {this.props.onClickPackager && (
    <MenuSection>
        <MenuItem
            onClick={this.handleClickPackager}
        >
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
            >
                <path d="M10 22V7a1 1 0 0 0-1-1H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5a1 1 0 0 0-1-1H2" />
                <rect x="14" y="2" width="8" height="8" rx="1" />
            </svg>

            <FormattedMessage
                defaultMessage="Package project"
                description="Menu bar item to open the current project in the packager"
                id="tw.menuBar.package"
            />
        </MenuItem>
    </MenuSection>
)}

<MenuSection>
    <MenuItem
        onClick={this.handleClickRestorePoints}
    >
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
        >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
        </svg>

        <FormattedMessage
            defaultMessage="Restore points"
            description="Menu bar item to manage restore points"
            id="tw.menuBar.restorePoints"
        />
    </MenuItem>
</MenuSection>

{!isEmbeddedEditor && (
    <MenuSection>
        <MenuItem
            isRtl={this.props.isRtl}
            onClick={this.handleClickGoHome}
        >
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
                className="lucide lucide-house"
            >
                <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
                <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>

            <FormattedMessage
                defaultMessage="Go Home"
                description="Menu bar item for returning to the CattyMod home page"
                id="tw.menuBar.goHome"
            />
        </MenuItem>
    </MenuSection>
)}
                                    )}


                                </MenuBarMenu>
                            </MenuLabel>
                        )}

                        <MenuLabel
                            open={this.props.editMenuOpen}
                            onOpen={this.props.onClickEdit}
                            onClose={this.props.onRequestCloseEdit}
                        >
                            <img
                                src={editIcon}
                                draggable={false}
                                width={20}
                                height={20}
                            />

                            <span className={styles.collapsibleLabel}>
                                <FormattedMessage
                                    defaultMessage="Edit"
                                    description="Text for edit dropdown menu"
                                    id="gui.menuBar.edit"
                                />
                            </span>

                            <img
                                src={dropdownCaret}
                                draggable={false}
                                width={8}
                                height={5}
                            />

                            <MenuBarMenu
                                className={classNames(styles.menuBarMenu)}
                                open={this.props.editMenuOpen}
                                place={this.props.isRtl ? 'left' : 'right'}
                            >

                                {this.props.isPlayerOnly ? null : (
                                    <DeletionRestorer>
                                        {(handleRestore, {restorable, deletedItem}) => (
                                            <MenuItem
                                                className={classNames({
                                                    [styles.disabled]: !restorable
                                                })}
                                                onClick={this.handleRestoreOption(handleRestore)}
                                            >
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
                                                >
                                                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                                    <path d="M21 3v5h-5" />
                                                </svg>
                                                {this.restoreOptionMessage(deletedItem)}
                                            </MenuItem>
                                        )}
                                    </DeletionRestorer>
                                )}

                                <MenuSection>

                                    {/* Turbo Mode */}
                                    <TurboMode>
                                        {(toggleTurboMode, {turboMode}) => (
                                            <MenuItem onClick={toggleTurboMode}>
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
                                                >
                                                    <path d="M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z" />
                                                </svg>

                                                {turboMode ? (
                                                    <FormattedMessage
                                                        defaultMessage="Turn off Turbo Mode"
                                                        description="Menu bar item for turning off turbo mode"
                                                        id="gui.menuBar.turboModeOff"
                                                    />
                                                ) : (
                                                    <FormattedMessage
                                                        defaultMessage="Turn on Turbo Mode"
                                                        description="Menu bar item for turning on turbo mode"
                                                        id="gui.menuBar.turboModeOn"
                                                    />
                                                )}
                                            </MenuItem>
                                        )}
                                    </TurboMode>

                                    {/* 60 FPS */}
                                    <FramerateChanger>
                                        {(changeFramerate, {framerate}) => (
                                            <MenuItem onClick={changeFramerate}>
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
                                                >
                                                    <path d="m12 14 4-4" />
                                                    <path d="M3.34 19a10 10 0 1 1 17.32 0" />
                                                </svg>

                                                {framerate === 60 ? (
                                                    <FormattedMessage
                                                        defaultMessage="Turn off 60 FPS Mode"
                                                        description="Menu bar item for turning off 60 FPS mode"
                                                        id="tw.menuBar.60off"
                                                    />
                                                ) : (
                                                    <FormattedMessage
                                                        defaultMessage="Turn on 60 FPS Mode"
                                                        description="Menu bar item for turning on 60 FPS mode"
                                                        id="tw.menuBar.60on"
                                                    />
                                                )}
                                            </MenuItem>
                                        )}
                                    </FramerateChanger>

                                    {/* Change Username */}
                                    <ChangeUsername>
                                        {changeUsername => (
                                            <MenuItem onClick={changeUsername}>
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
                                                >
                                                    <path d="M11.5 15H7a4 4 0 0 0-4 4v2" />
                                                    <path d="M21.378 16.626a1 1 0 0 0-3.004-3.004l-4.01 4.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" />
                                                    <circle cx="10" cy="7" r="4" />
                                                </svg>

                                                <FormattedMessage
                                                    defaultMessage="Change Username"
                                                    description="Menu bar item for changing the username"
                                                    id="tw.menuBar.changeUsername"
                                                />
                                            </MenuItem>
                                        )}
                                    </ChangeUsername>

                                    {/* Cloud Variables */}
                                    <CloudVariablesToggler>
                                        {(toggleCloudVariables, {enabled, canUseCloudVariables}) => (
                                            <MenuItem
                                                className={classNames({
                                                    [styles.disabled]: !canUseCloudVariables
                                                })}
                                                onClick={toggleCloudVariables}
                                            >
                                                {canUseCloudVariables ? (
                                                    enabled ? (
                                                        <React.Fragment>
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-off"><path d="M10.94 5.274A7 7 0 0 1 15.71 10h1.79a4.5 4.5 0 0 1 4.222 6.057"/><path d="M18.796 18.81A4.5 4.5 0 0 1 17.5 19H9A7 7 0 0 1 5.79 5.78"/><path d="m2 2 20 20"/></svg>

                                                            <FormattedMessage
                                                                defaultMessage="Disable Cloud Variables"
                                                                description="Menu bar item for disabling cloud variables"
                                                                id="tw.menuBar.cloudOff"
                                                            />
                                                        </React.Fragment>
                                                    ) : (
                                                        <React.Fragment>
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
                                                            >
                                                                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
                                                            </svg>

                                                            <FormattedMessage
                                                                defaultMessage="Enable Cloud Variables"
                                                                description="Menu bar item for enabling cloud variables"
                                                                id="tw.menuBar.cloudOn"
                                                            />
                                                        </React.Fragment>
                                                    )
                                                ) : (
                                                    <React.Fragment>
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
                                                        >
                                                            <path d="M10.94 5.274A7 7 0 0 1 15.71 10h1.79a4.5 4.5 0 0 1 4.222 6.057" />
                                                            <path d="M18.796 18.81A4.5 4.5 0 0 1 17.5 19H9A7 7 0 1 1 5.79 5.78" />
                                                            <path d="m2 2 20 20" />
                                                        </svg>

                                                        <FormattedMessage
                                                            defaultMessage="Cloud Variables are not Available"
                                                            description="Menu bar item for when cloud variables are not available"
                                                            id="tw.menuBar.cloudUnavailable"
                                                        />
                                                    </React.Fragment>
                                                )}
                                            </MenuItem>
                                        )}
                                    </CloudVariablesToggler>

                                </MenuSection>

                                <MenuSection>
                                    <MenuItem onClick={this.props.onClickSettingsModal}>
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
                                        >
                                            <path d="M10 5H3" />
                                            <path d="M12 19H3" />
                                            <path d="M14 3v4" />
                                            <path d="M16 17v4" />
                                            <path d="M21 12h-9" />
                                            <path d="M21 19h-5" />
                                            <path d="M21 5h-7" />
                                            <path d="M8 10v4" />
                                            <path d="M8 12H3" />
                                        </svg>

                                        <FormattedMessage
                                            defaultMessage="Advanced Settings"
                                            description="Menu bar item for advanced settings"
                                            id="tw.menuBar.moreSettings"
                                        />
                                    </MenuItem>
                                </MenuSection>

                            </MenuBarMenu>
                        </MenuLabel>

                        {this.props.isTotallyNormal && (
                            <MenuLabel
                                open={this.props.modeMenuOpen}
                                onOpen={this.props.onClickMode}
                                onClose={this.props.onRequestCloseMode}
                            >
                                <FormattedMessage
                                    defaultMessage="Mode"
                                    description="Mode menu item in the menu bar"
                                    id="gui.menuBar.modeMenu"
                                />

                                <MenuBarMenu
                                    className={classNames(styles.menuBarMenu)}
                                    open={this.props.modeMenuOpen}
                                    place={this.props.isRtl ? 'left' : 'right'}
                                >
                                    <MenuSection>
                                        <MenuItem onClick={this.handleSetMode('NOW')}>
                                            <span
                                                className={classNames({
                                                    [styles.inactive]: !this.props.modeNow
                                                })}
                                            >
                                                {'✓'}
                                            </span>
                                            {' '}

                                            <FormattedMessage
                                                defaultMessage="Normal mode"
                                                description="April fools: resets editor to not have any pranks"
                                                id="gui.menuBar.normalMode"
                                            />
                                        </MenuItem>

                                        <MenuItem onClick={this.handleSetMode('2020')}>
                                            <span
                                                className={classNames({
                                                    [styles.inactive]: !this.props.mode2020
                                                })}
                                            >
                                                {'✓'}
                                            </span>
                                            {' '}

                                            <FormattedMessage
                                                defaultMessage="Caturday mode"
                                                description="April fools: Cat blocks mode"
                                                id="gui.menuBar.caturdayMode"
                                            />
                                        </MenuItem>
                                    </MenuSection>
                                </MenuBarMenu>
                            </MenuLabel>
                        )}

                        {this.props.onClickAddonSettings && (
                            <div
                                className={classNames(
                                    styles.menuBarItem,
                                    styles.hoverable
                                )}
                                onClick={this.props.onClickAddonSettings}
                            >
                                <img
                                    src={addonsIcon}
                                    draggable={false}
                                    width={20}
                                    height={20}
                                />

                                <span className={styles.collapsibleLabel}>
                                    <FormattedMessage
                                        defaultMessage="Addons"
                                        description="Button to open addon settings"
                                        id="tw.menuBar.addons"
                                    />
                                </span>
                            </div>
                        )}

                        {this.props.onClickSettingsModal && (
                            <div
                                className={classNames(
                                    styles.menuBarItem,
                                    styles.hoverable
                                )}
                                onClick={this.props.onClickSettingsModal}
                            >
                                <img
                                    src={advancedIcon}
                                    draggable={false}
                                    width={20}
                                    height={20}
                                />

                                <span className={styles.collapsibleLabel}>
                                    <FormattedMessage
                                        defaultMessage="Advanced"
                                        description="Button to open advanced settings menu"
                                        id="tw.menuBar.advanced"
                                    />
                                </span>
                            </div>
                        )}
                    </div>

                    <Divider className={styles.divider} />

                    {this.props.canEditTitle ? (
                        <div
                            className={classNames(
                                styles.menuBarItem,
                                styles.growable
                            )}
                        >
                            <MenuBarItemTooltip
                                enable
                                id="title-field"
                            >
                                <ProjectTitleInput
                                    className={classNames(
                                        styles.titleFieldGrowable
                                    )}
                                />
                            </MenuBarItemTooltip>
                        </div>
                    ) : (
                        (this.props.authorUsername &&
                            this.props.authorUsername !== this.props.username) ? (
                            <AuthorInfo
                                className={styles.authorInfo}
                                imageUrl={this.props.authorThumbnailUrl}
                                projectId={this.props.projectId}
                                projectTitle={this.props.projectTitle}
                                userId={this.props.authorId}
                                username={this.props.authorUsername}
                            />
                        ) : null
                    )}

                    {this.props.canShare ? (
                        (this.props.isShowingProject ||
                            this.props.isUpdating) && (
                            <div className={classNames(styles.menuBarItem)}>
                                <ProjectWatcher
                                    onDoneUpdating={this.props.onSeeCommunity}
                                >
                                    {waitForUpdate => (
                                        <ShareButton
                                            className={styles.menuBarButton}
                                            isShared={this.props.isShared}
                                            onClick={() => {
                                                this.handleClickShare(waitForUpdate);
                                            }}
                                        />
                                    )}
                                </ProjectWatcher>
                            </div>
                        )
                    ) : this.props.showComingSoon ? (
                        <div className={classNames(styles.menuBarItem)}>
                            <MenuBarItemTooltip id="share-button">
                                <ShareButton
                                    className={styles.menuBarButton}
                                />
                            </MenuBarItemTooltip>
                        </div>
                    ) : null}

                    {this.props.canRemix && (
                        <div className={classNames(styles.menuBarItem)}>
                            {remixButton}
                        </div>
                    )}

                    {!(window.parent !== window &&
                        !new URLSearchParams(window.location.search).has(
                            'showprojectpage'
                        )) && (
                        <div
                            className={classNames(
                                styles.menuBarItem,
                                styles.communityButtonWrapper
                            )}
                        >
                            {this.props.enableCommunity ? (
                                (this.props.isShowingProject ||
                                    this.props.isUpdating) && (
                                    <ProjectWatcher
                                        onDoneUpdating={this.props.onSeeCommunity}
                                    >
                                        {waitForUpdate => (
                                            <CommunityButton
                                                className={styles.menuBarButton}
                                                onClick={() => {
                                                    this.handleClickSeeCommunity(
                                                        waitForUpdate
                                                    );
                                                }}
                                            />
                                        )}
                                    </ProjectWatcher>
                                )
                            ) : (
                                this.props.showComingSoon ? (
                                    <MenuBarItemTooltip id="community-button">
                                        <CommunityButton
                                            className={styles.menuBarButton}
                                        />
                                    </MenuBarItemTooltip>
                                ) : (
                                    this.props.enableSeeInside ? (
                                        <SeeInsideButton
                                            className={styles.menuBarButton}
                                            onClick={this.handleClickSeeInside}
                                        />
                                    ) : []
                                )
                            )}
                        </div>
                    )}

                    <div className={styles.menuBarItem}>
                        <a
                            className={styles.feedbackLink}
                            href="https://scratch.mit.edu/projects/1335032585/"
                            rel="noopener noreferrer"
                            target="_blank"
                        >
                            <Button className={styles.feedbackButton}>
                                <FormattedMessage
                                    defaultMessage="{APP_NAME} Feedback"
                                    description="Button to give feedback in the menu bar"
                                    id="tw.feedbackButton"
                                    values={{
                                        APP_NAME
                                    }}
                                />
                            </Button>
                        </a>
                    </div>
                </div>

                <div className={styles.accountInfoGroup}>
                    <TWSaveStatus
                        showSaveFilePicker={this.props.showSaveFilePicker}
                    />
                </div>

                {aboutButton}
            </Box>
        );

        return (
            <React.Fragment>
                {menuBar}
                <TWNews />
            </React.Fragment>
        );
    }
}

MenuBar.propTypes = {
    enableSeeInside: PropTypes.bool,
    onClickSeeInside: PropTypes.func,
    aboutMenuOpen: PropTypes.bool,
    accountMenuOpen: PropTypes.bool,
    authorId: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    authorThumbnailUrl: PropTypes.string,
    authorUsername: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
    autoUpdateProject: PropTypes.func,
    canChangeLanguage: PropTypes.bool,
    canChangeTheme: PropTypes.bool,
    canCreateCopy: PropTypes.bool,
    canCreateNew: PropTypes.bool,
    canEditTitle: PropTypes.bool,
    canManageFiles: PropTypes.bool,
    canRemix: PropTypes.bool,
    canSave: PropTypes.bool,
    canShare: PropTypes.bool,
    className: PropTypes.string,
    errors: PropTypes.arrayOf(PropTypes.shape({
        sprite: PropTypes.string,
        error: PropTypes.string,
        id: PropTypes.number
    })),
    errorsMenuOpen: PropTypes.bool,
    onClickErrors: PropTypes.func,
    onRequestCloseErrors: PropTypes.func,
    confirmReadyToReplaceProject: PropTypes.func,
    currentLocale: PropTypes.string.isRequired,
    editMenuOpen: PropTypes.bool,
    enableCommunity: PropTypes.bool,
    fileMenuOpen: PropTypes.bool,
    handleSaveProject: PropTypes.func,
    intl: intlShape,
    isPlayerOnly: PropTypes.bool,
    isRtl: PropTypes.bool,
    isShared: PropTypes.bool,
    isShowingProject: PropTypes.bool,
    isTotallyNormal: PropTypes.bool,
    isUpdating: PropTypes.bool,
    locale: PropTypes.string.isRequired,
    loginMenuOpen: PropTypes.bool,
    mode1920: PropTypes.bool,
    mode1990: PropTypes.bool,
    mode2020: PropTypes.bool,
    mode220022BC: PropTypes.bool,
    modeMenuOpen: PropTypes.bool,
    modeNow: PropTypes.bool,
    onClickAbout: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.arrayOf(
            PropTypes.shape({
                title: PropTypes.string,
                onClick: PropTypes.func
            })
        )
    ]),
    onClickAccount: PropTypes.func,
    onClickAddonSettings: PropTypes.func,
    onClickDesktopSettings: PropTypes.func,
    onClickPackager: PropTypes.func,
    onClickRestorePoints: PropTypes.func,
    onClickEdit: PropTypes.func,
    onClickFile: PropTypes.func,
    onClickLogin: PropTypes.func,
    onClickMode: PropTypes.func,
    onClickNew: PropTypes.func,
    onClickNewWindow: PropTypes.func,
    onClickRemix: PropTypes.func,
    onClickSave: PropTypes.func,
    onClickSaveAsCopy: PropTypes.func,
    onClickSettings: PropTypes.func,
    onClickSettingsModal: PropTypes.func,
    onLogOut: PropTypes.func,
    onOpenRegistration: PropTypes.func,
    onOpenTipLibrary: PropTypes.func,
    onProjectTelemetryEvent: PropTypes.func,
    onRequestCloseAbout: PropTypes.func,
    onRequestCloseAccount: PropTypes.func,
    onRequestCloseEdit: PropTypes.func,
    onRequestCloseFile: PropTypes.func,
    onRequestCloseLogin: PropTypes.func,
    onRequestCloseMode: PropTypes.func,
    onRequestCloseSettings: PropTypes.func,
    onRequestOpenAbout: PropTypes.func,
    onSeeCommunity: PropTypes.func,
    onSetTimeTravelMode: PropTypes.func,
    onShare: PropTypes.func,
    onStartSelectingFileUpload: PropTypes.func,
    onToggleLoginOpen: PropTypes.func,
    projectId: PropTypes.string,
    projectTitle: PropTypes.string,
    renderLogin: PropTypes.func,
    sessionExists: PropTypes.bool,
    settingsMenuOpen: PropTypes.bool,
    shouldSaveBeforeTransition: PropTypes.func,
    showSaveFilePicker: PropTypes.func,
    showComingSoon: PropTypes.bool,
    username: PropTypes.string,
    userOwnsProject: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired
};

MenuBar.defaultProps = {
    onShare: () => {}
};

const mapStateToProps = (state, ownProps) => {
    const loadingState = state.scratchGui.projectState.loadingState;
    const user = state.session &&
        state.session.session &&
        state.session.session.user;

    return {
        authorUsername: state.scratchGui.tw.author.username,
        authorThumbnailUrl: state.scratchGui.tw.author.thumbnail,
        projectId: state.scratchGui.projectState.projectId,
        aboutMenuOpen: aboutMenuOpen(state),
        accountMenuOpen: accountMenuOpen(state),
        currentLocale: state.locales.locale,
        fileMenuOpen: fileMenuOpen(state),
        editMenuOpen: editMenuOpen(state),
        errors: state.scratchGui.tw.compileErrors,
        errorsMenuOpen: errorsMenuOpen(state),
        isPlayerOnly: state.scratchGui.mode.isPlayerOnly,
        isRtl: state.locales.isRtl,
        isUpdating: getIsUpdating(loadingState),
        isShowingProject: getIsShowingProject(loadingState),
        locale: state.locales.locale,
        loginMenuOpen: loginMenuOpen(state),
        modeMenuOpen: modeMenuOpen(state),
        projectTitle: state.scratchGui.projectTitle,
        sessionExists: state.session &&
            typeof state.session.session !== 'undefined',
        settingsMenuOpen: settingsMenuOpen(state),
        username: user ? user.username : null,
        userOwnsProject: ownProps.authorUsername &&
            user &&
            (ownProps.authorUsername === user.username),
        vm: state.scratchGui.vm,
        mode220022BC: isTimeTravel220022BC(state),
        mode1920: isTimeTravel1920(state),
        mode1990: isTimeTravel1990(state),
        mode2020: isTimeTravel2020(state),
        modeNow: isTimeTravelNow(state)
    };
};

const mapDispatchToProps = dispatch => ({
    onClickSeeInside: () => dispatch(setPlayer(false)),
    autoUpdateProject: () => dispatch(autoUpdateProject()),
    onOpenTipLibrary: () => dispatch(openTipsLibrary()),
    onClickAccount: () => dispatch(openAccountMenu()),
    onRequestCloseAccount: () => dispatch(closeAccountMenu()),
    onClickFile: () => dispatch(openFileMenu()),
    onRequestCloseFile: () => dispatch(closeFileMenu()),
    onClickEdit: () => dispatch(openEditMenu()),
    onRequestCloseEdit: () => dispatch(closeEditMenu()),
    onClickErrors: () => dispatch(openErrorsMenu()),
    onRequestCloseErrors: () => dispatch(closeErrorsMenu()),
    onClickLogin: () => dispatch(openLoginMenu()),
    onRequestCloseLogin: () => dispatch(closeLoginMenu()),
    onClickMode: () => dispatch(openModeMenu()),
    onRequestCloseMode: () => dispatch(closeModeMenu()),
    onRequestOpenAbout: () => dispatch(openAboutMenu()),
    onRequestCloseAbout: () => dispatch(closeAboutMenu()),
    onClickRestorePoints: () => dispatch(openRestorePointModal()),
    onClickSettings: () => dispatch(openSettingsMenu()),
    onClickSettingsModal: () => {
        dispatch(closeEditMenu());
        dispatch(openSettingsModal());
    },
    onRequestCloseSettings: () => dispatch(closeSettingsMenu()),
    onClickNew: needSave => {
        dispatch(requestNewProject(needSave));
        dispatch(setFileHandle(null));
    },
    onClickRemix: () => dispatch(remixProject()),
    onClickSave: () => dispatch(manualUpdateProject()),
    onClickSaveAsCopy: () => dispatch(saveProjectAsCopy()),
    onSeeCommunity: () => {
        dispatch(setPlayer(true));

        if (window.location.pathname !== '/') {
            window.history.pushState(
                {},
                '',
                `/${window.location.search}${window.location.hash}`
            );
            window.dispatchEvent(new PopStateEvent('popstate'));
        }
    },
    onSetTimeTravelMode: mode => dispatch(setTimeTravel(mode))
});

export default compose(
    injectIntl,
    MenuBarHOC,
    connect(
        mapStateToProps,
        mapDispatchToProps
    )
)(MenuBar);
