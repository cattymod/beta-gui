import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import {intlShape, injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import log from '../lib/log';
import sharedMessages from './shared-messages';
import {setFileHandle, setProjectError} from '../reducers/tw';

import {
    LoadingStates,
    getIsLoadingUpload,
    getIsShowingWithoutId,
    onLoadedProject,
    requestProjectUpload,
    getIsShowingProject
} from '../reducers/project-state';
import {setProjectTitle} from '../reducers/project-title';
import {
    openLoadingProject,
    closeLoadingProject,
    openInvalidProjectModal
} from '../reducers/modals';
import {
    closeFileMenu
} from '../reducers/menus';

/**
 * Wait for the browser to draw the current state of the page to the screen.
 * @returns {Promise<void>} Resolves after the next frame is drawn.
 */
const waitForPaint = () => new Promise(resolve => {
    // Animation frame callbacks run just before the frame is drawn, so wait for one more task.
    requestAnimationFrame(() => setTimeout(resolve));
    // In case we get hidden, don't wait forever for a frame that won't come.
    setTimeout(resolve, 100);
});

/**
 * Higher Order Component to provide behavior for loading local project files into editor.
 * @param {React.Component} WrappedComponent the component to add project file loading functionality to
 * @returns {React.Component} WrappedComponent with project file loading functionality added
 *
 * <SBFileUploaderHOC>
 *     <WrappedComponent />
 * </SBFileUploaderHOC>
 */
const SBFileUploaderHOC = function (WrappedComponent) {
    class SBFileUploaderComponent extends React.Component {
        constructor (props) {
            super(props);

            bindAll(this, [
                'createFileObjects',
                'getProjectTitleFromFilename',
                'handleFinishedLoadingUpload',
                'handleStartSelectingFileUpload',
                'handleChange',
                'onload',
                'onerror',
                'removeFileObjects'
            ]);

            this.expectingFileUploadFinish = false;
        }

        componentDidUpdate (prevProps) {
            if (
                this.props.isLoadingUpload &&
                !prevProps.isLoadingUpload &&
                this.expectingFileUploadFinish
            ) {
                this.handleFinishedLoadingUpload();
            }
        }

        componentWillUnmount () {
            this.removeFileObjects();
        }

        isAppleDevice () {
            const userAgent = navigator.userAgent || '';
            const platform = navigator.platform || '';

            return (
                /iPhone|iPad|iPod|Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent) ||
                (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
            );
        }
        // step 2: create a FileReader and an <input> element, and issue a
        // pseudo-click to it. That will open the file chooser dialog.
        createFileObjects () {
            // redo step 7, in case it got skipped last time and its objects are
            // still in memory
            this.removeFileObjects();
            // create fileReader
            this.fileReader = new FileReader();
            this.fileReader.onload = this.onload;
            this.fileReader.onerror = this.onerror;
            // tw: Use FS API when available
            if (this.props.showOpenFilePicker) {
                (async () => {
                    try {
                        const [handle] = await this.props.showOpenFilePicker({
                            multiple: false,
                            types: [
                                {
                                    description: 'Scratch Project',
                                    accept: {
                                        // Chrome on Android tracks the MIME type of files that get downloaded and
                                        // then actually enforces that the type must match in showOpenFilePicker()
                                        // and does not allow the user to override the filter. As Scratch projects have
                                        // no well-defined and well-adopted MIME types, we can't assume anything about
                                        // what MIME type they are saved with, so we have to use the most broad MIME
                                        // type here. Otherwise some users just won't be able to load files for no
                                        // fault of their own.
                                        '*/*': ['.sb', '.sb2', '.sb3']
                                    }
                                }
                            ]
                        });
                        const file = await handle.getFile();
                        this.handleChange({
                            target: {
                                files: [file],
                                handle: handle
                            }
                        });
                    } catch (err) {
                        // If the user aborted it, that's not an error.
                        if (err && err.name === 'AbortError') {
                            return;
                        }
                        log.error(err);
                    }
                })();
            } else {
                // create <input> element and add it to DOM
                this.inputElement = document.createElement('input');
                this.inputElement.accept = '.sb,.sb2,.sb3';
                this.inputElement.style = 'display: none;';
                this.inputElement.type = 'file';
                this.inputElement.onchange = this.handleChange; // connects to step 3
                document.body.appendChild(this.inputElement);
                // simulate a click to open file chooser dialog
                this.inputElement.click();
            }
        }

        getSupportedExtensions () {
            const extensions = [
                'cmp',
                'pmp',
                'snail',
                'zip',
                'sb',
                'sb2',
                'sb3'
            ];

            // Read the custom extension from localStorage.
            try {
                const customFileType = localStorage.getItem('cattymod:saveFileType');

                if (customFileType) {
                    // Remove a leading dot if one was saved.
                    const normalizedExtension = customFileType
                        .trim()
                        .replace(/^\./, '')
                        .toLowerCase();

                    // Only add it if it isn't already supported.
                    if (
                        normalizedExtension &&
                        /^[a-z0-9_-]+$/.test(normalizedExtension) &&
                        !extensions.includes(normalizedExtension)
                    ) {
                        extensions.push(normalizedExtension);
                    }
                }
            } catch (err) {
                // Ignore localStorage errors.
            }

            return extensions;
        }

        handleStartSelectingFileUpload () {
            this.expectingFileUploadFinish = true;
            this.createFileObjects();
        }

        createFileObjects () {
            this.removeFileObjects();

            const isAppleDevice = this.isAppleDevice();
            const useHtmlPicker = this.useHtmlFilePicker();
            const supportedExtensions = this.getSupportedExtensions();

            const extensionList = supportedExtensions
                .map(extension => `.${extension}`);

            this.fileReader = new FileReader();
            this.fileReader.onload = this.onload;

            // Use the native picker unless the HTML picker setting is enabled.
            if (!useHtmlPicker && this.props.showOpenFilePicker) {
                try {
                    const pickerOptions = {
                        multiple: false
                    };

                    // Only restrict extensions on non-Apple devices.
                    if (!isAppleDevice) {
                        pickerOptions.types = [
                            {
                                description: 'CattyMod Project',
                                accept: {
                                    '*/*': extensionList
                                }
                            }
                        ];
                    }

                    const pickerPromise =
                        this.props.showOpenFilePicker(pickerOptions);

                    pickerPromise.then(async handles => {
                        try {
                            const handle = handles[0];

                            if (!handle) {
                                this.expectingFileUploadFinish = false;
                                this.removeFileObjects();
                                return;
                            }

                            const file = await handle.getFile();

                            this.handleChange({
                                target: {
                                    files: [file],
                                    handle: handle
                                }
                            });
                        } catch (err) {
                            this.expectingFileUploadFinish = false;
                            this.removeFileObjects();
                            log.error(err);
                        }
                    }).catch(err => {
                        this.expectingFileUploadFinish = false;
                        this.removeFileObjects();

                        if (err && err.name !== 'AbortError') {
                            log.error(err);
                        }
                    });

                    return;
                } catch (err) {
                    this.expectingFileUploadFinish = false;
                    this.removeFileObjects();
                    log.error(err);
                }
            }

            // HTML picker fallback.
            this.inputElement = document.createElement('input');
            this.inputElement.type = 'file';
            this.inputElement.style.display = 'none';

            // Apple devices can select any file type.
            // Other devices use supported extensions, including custom ones.
            if (!isAppleDevice) {
                this.inputElement.accept = extensionList.join(',');
            }

            this.inputElement.onchange = this.handleChange;

            document.body.appendChild(this.inputElement);
            this.inputElement.click();
        }

        handleChange (e) {
            const {
                intl,
                isShowingWithoutId,
                loadingState,
                projectChanged,
                userOwnsProject
            } = this.props;

            const thisFileInput = e.target;

            if (
                thisFileInput.files &&
                thisFileInput.files.length > 0
            ) {
                this.fileToUpload = thisFileInput.files[0];

                let uploadAllowed = true;

                if (userOwnsProject || (projectChanged && isShowingWithoutId)) {
                    uploadAllowed = confirm(
                        intl.formatMessage(sharedMessages.replaceProjectWarning)
                    );
                }

                if (uploadAllowed) {
                    const handle = thisFileInput.handle;
                    const filename = this.fileToUpload.name || '';

                    const supportedExtensions = this.getSupportedExtensions();

                    const extensionMatch = filename.match(/\.([^.]+)$/);
                    const fileExtension = extensionMatch ?
                        extensionMatch[1].toLowerCase() :
                        '';

                    const supportedExtension =
                        supportedExtensions.includes(fileExtension);

                    // Preserve file handles for supported and custom extensions.
                    if (handle && supportedExtension) {
                        this.props.onSetFileHandle(handle);
                    } else {
                        this.props.onSetFileHandle(null);
                    }

                    // Upload the selected file.
                    this.props.requestProjectUpload(loadingState);
                } else {
                    this.expectingFileUploadFinish = false;
                    this.removeFileObjects();
                }

                this.props.closeFileMenu();
            }
        }

        handleFinishedLoadingUpload () {
            this.expectingFileUploadFinish = false;

            if (this.fileToUpload && this.fileReader) {
                this.props.onLoadingStarted();
                // begin to read data from the file. When finished,
                // cues step 6 using the reader's onload callback
                this.fileReader.readAsArrayBuffer(this.fileToUpload);
            } else {
                this.props.cancelFileUpload(this.props.loadingState);
                this.removeFileObjects();
            }
        }

        getProjectTitleFromFilename (fileInputFilename) {
            if (!fileInputFilename) return '';

            const filename = fileInputFilename.replace(/\.[^/.]+$/, '');

            return filename.substring(0, 100);
        }

        onload () {
            if (this.fileReader) {
                const data = this.fileReader.result;
                const filename = this.fileToUpload && this.fileToUpload.name;
                let loadingSuccess = false;
                // Loading can block the main thread for a long time, or could be extremely quick.
                // So we want to make sure we show the loading screen at least briefly.
                waitForPaint()
                    .then(() => {
                        // tw: stop when loading new project
                        this.props.vm.quit();
                        return this.props.vm.loadProject(data);
                    })
                    .then(() => {
                        if (filename) {
                            const uploadedProjectTitle =
                                this.getProjectTitleFromFilename(filename);

                            this.props.onSetProjectTitle(uploadedProjectTitle);
                        }

                        this.props.vm.renderer.draw();
                        loadingSuccess = true;
                    })
                    .catch(error => {
                        log.error(error);
                        this.props.onLoadingFailed(error);
                    })
                    .then(() => {
                        this.props.onLoadingFinished(
                            this.props.loadingState,
                            loadingSuccess
                        );

                        this.removeFileObjects();
                    });
            }
        }
        // The file could not be read. The loading screen is already open, so it has to be closed.
        onerror () {
            if (this.fileReader) {
                const error = this.fileReader.error;
                log.error(error);
                this.props.onLoadingFailed(error);
                this.props.onLoadingFinished(this.props.loadingState, false);
                this.removeFileObjects();
            }
        }
        // step 7: remove the <input> element from the DOM and clear reader and
        // fileToUpload reference, so those objects can be garbage collected
        removeFileObjects () {
            if (this.inputElement && this.inputElement.parentNode) {
                this.inputElement.parentNode.removeChild(this.inputElement);
            }

            this.inputElement = null;
            this.fileReader = null;
            this.fileToUpload = null;
        }

        render () {
            const {
                cancelFileUpload,
                closeFileMenu: closeFileMenuProp,
                isLoadingUpload,
                isShowingWithoutId,
                loadingState,
                onLoadingFailed,
                onLoadingFinished,
                onLoadingStarted,
                onSetFileHandle,
                onSetProjectTitle,
                projectChanged,
                requestProjectUpload: requestProjectUploadProp,
                userOwnsProject,
                ...componentProps
            } = this.props;

            return (
                <React.Fragment>
                    <WrappedComponent
                        onStartSelectingFileUpload={this.handleStartSelectingFileUpload}
                        {...componentProps}
                    />
                </React.Fragment>
            );
        }
    }

    SBFileUploaderComponent.propTypes = {
        canSave: PropTypes.bool,
        cancelFileUpload: PropTypes.func,
        closeFileMenu: PropTypes.func,
        intl: intlShape.isRequired,
        isLoadingUpload: PropTypes.bool,
        isShowingProject: PropTypes.bool,
        isShowingWithoutId: PropTypes.bool,
        loadingState: PropTypes.oneOf(LoadingStates),
        onLoadingFailed: PropTypes.func,
        onLoadingFinished: PropTypes.func,
        onLoadingStarted: PropTypes.func,
        onSetProjectTitle: PropTypes.func,
        projectChanged: PropTypes.bool,
        requestProjectUpload: PropTypes.func,
        showOpenFilePicker: PropTypes.func,
        userOwnsProject: PropTypes.bool,
        vm: PropTypes.shape({
            loadProject: PropTypes.func,
            quit: PropTypes.func,
            renderer: PropTypes.shape({
                draw: PropTypes.func
            })
        }),
        onSetFileHandle: PropTypes.func
    };

    SBFileUploaderComponent.defaultProps = {
        showOpenFilePicker:
            typeof window !== 'undefined' &&
            typeof window.showOpenFilePicker === 'function' &&
            !navigator.userAgent.includes('Android') ?
                window.showOpenFilePicker.bind(window) :
                null
    };

    const mapStateToProps = (state, ownProps) => {
        const loadingState = state.scratchGui.projectState.loadingState;
        const user = state.session && state.session.session && state.session.session.user;

        return {
            isLoadingUpload: getIsLoadingUpload(loadingState),
            isShowingProject: getIsShowingProject(loadingState),
            isShowingWithoutId: getIsShowingWithoutId(loadingState),
            loadingState: loadingState,
            projectChanged: state.scratchGui.projectChanged,
            userOwnsProject: ownProps.authorUsername && user &&
                (ownProps.authorUsername === user.username),
            vm: state.scratchGui.vm
        };
    };

    const mapDispatchToProps = (dispatch, ownProps) => ({
        cancelFileUpload: loadingState =>
            dispatch(onLoadedProject(loadingState, false, false)),

        closeFileMenu: () => dispatch(closeFileMenu()),

        onLoadingFailed: error => {
            dispatch(setProjectError(error));
            dispatch(openInvalidProjectModal());
        },

        onLoadingFinished: (loadingState, success) => {
            dispatch(onLoadedProject(loadingState, ownProps.canSave, success));
            dispatch(closeLoadingProject());
            dispatch(closeFileMenu());
        },

        onLoadingStarted: () => dispatch(openLoadingProject()),

        onSetProjectTitle: title => dispatch(setProjectTitle(title)),

        requestProjectUpload: loadingState =>
            dispatch(requestProjectUpload(loadingState)),

        onSetFileHandle: fileHandle => dispatch(setFileHandle(fileHandle))
    });

    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {},
        stateProps,
        dispatchProps,
        ownProps
    );

    return injectIntl(connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )(SBFileUploaderComponent));
};

export {
    SBFileUploaderHOC as default
};
