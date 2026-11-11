import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import {intlShape, injectIntl} from 'react-intl';
import {connect} from 'react-redux';
import log from '../lib/log';
import sharedMessages from './shared-messages';
import {setFileHandle, setProjectError} from '../reducers/tw';
import {getShowOpenFilePicker} from './tw-file-system-access';

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

        useHtmlFilePicker () {
            try {
                return localStorage.getItem('cattymod:htmlpicker') === 'true';
            } catch (err) {
                return false;
            }
        }

        handleStartSelectingFileUpload () {
            this.expectingFileUploadFinish = true;
            this.createFileObjects();
        }

        createFileObjects () {
            this.removeFileObjects();

            const isAppleDevice = this.isAppleDevice();
            const useHtmlPicker = this.useHtmlFilePicker();

            this.fileReader = new FileReader();
            this.fileReader.onload = this.onload;

            // Use the native picker unless the HTML picker setting is enabled.
            if (!useHtmlPicker && this.props.showOpenFilePicker) {
                try {
                    // Call immediately during the user's click event.
                    const pickerOptions = {
                        multiple: false
                    };

                    // Only restrict extensions on non-Apple devices.
                    if (!isAppleDevice) {
                        pickerOptions.types = [
                            {
                                description: 'CattyMod Project',
                                accept: {
                                    '*/*': [
                                        '.cmp',
                                        '.pmp',
                                        '.snail',
                                        '.zip',
                                        '.sb',
                                        '.sb2',
                                        '.sb3'
                                    ]
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
            // Other devices retain the original extension filter.
            if (!isAppleDevice) {
                this.inputElement.accept =
                    '.cmp,.pmp,.snail,.zip,.sb,.sb2,.sb3';
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

                    const supportedExtension =
                        /\.(?:cmp|pmp|snail|zip|sb|sb2|sb3)$/i.test(filename);

                    // Only preserve project file handles for supported extensions.
                    if (handle && supportedExtension) {
                        this.props.onSetFileHandle(handle);
                    } else {
                        this.props.onSetFileHandle(null);
                    }

                    // Upload the selected file.
                    // Apple devices are not restricted by extension.
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
                this.props.onLoadingStarted();

                const filename = this.fileToUpload && this.fileToUpload.name;
                let loadingSuccess = false;

                this.props.vm.quit();

                this.props.vm.loadProject(this.fileReader.result)
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
        showOpenFilePicker: getShowOpenFilePicker()
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
