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
 * Higher Order Component to provide behavior for loading local project files into editor.
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

        // Detect Apple devices.
        isAppleDevice () {
            const userAgent = navigator.userAgent || '';
            const platform = navigator.platform || '';

            return (
                /iPhone|iPad|iPod|Macintosh|MacIntel|MacPPC|Mac68K/i.test(userAgent) ||
                (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
            );
        }

        // Step 1: Begin file upload.
        handleStartSelectingFileUpload () {
            this.expectingFileUploadFinish = true;
            this.createFileObjects();
        }

        // Step 2: Create FileReader and file picker.
        createFileObjects () {
            this.removeFileObjects();

            const isAppleDevice = this.isAppleDevice();

            this.fileReader = new FileReader();
            this.fileReader.onload = this.onload;

            if (this.props.showOpenFilePicker) {
                (async () => {
                    try {
                        const [handle] = await this.props.showOpenFilePicker({
                            multiple: false,
                            ...(isAppleDevice ? {} : {
                                types: [
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
                                ]
                            })
                        });

                        const file = await handle.getFile();

                        this.handleChange({
                            target: {
                                files: [file],
                                handle: handle
                            }
                        });
                    } catch (err) {
                        if (err && err.name === 'AbortError') {
                            return;
                        }

                        log.error(err);
                    }
                })();
            } else {
                this.inputElement = document.createElement('input');

                // Apple devices accept all file formats.
                // Other devices only accept supported project formats.
                this.inputElement.accept = isAppleDevice ?
                    '*/*' :
                    '.cmp,.pmp,.snail,.zip,.sb,.sb2,.sb3';

                this.inputElement.style = 'display: none;';
                this.inputElement.type = 'file';
                this.inputElement.onchange = this.handleChange;

                document.body.appendChild(this.inputElement);
                this.inputElement.click();
            }
        }

        // Step 3: Handle selected file.
        handleChange (e) {
            const {
                intl,
                isShowingWithoutId,
                loadingState,
                projectChanged,
                userOwnsProject
            } = this.props;

            const thisFileInput = e.target;

            if (thisFileInput.files && thisFileInput.files.length > 0) {
                this.fileToUpload = thisFileInput.files[0];

                let uploadAllowed = true;

                if (userOwnsProject || (projectChanged && isShowingWithoutId)) {
                    uploadAllowed = confirm(
                        intl.formatMessage(sharedMessages.replaceProjectWarning)
                    );
                }

                if (uploadAllowed) {
                    const handle = thisFileInput.handle;

                    if (handle) {
                        if (this.fileToUpload.name.endsWith('.sb3')) {
                            this.props.onSetFileHandle(handle);
                        } else {
                            this.props.onSetFileHandle(null);
                        }
                    }

                    this.props.requestProjectUpload(loadingState);
                } else {
                    this.removeFileObjects();
                }

                this.props.closeFileMenu();
            }
        }

        // Step 4: Redux handles project upload state.

        // Step 5: Wait for project upload state.
        handleFinishedLoadingUpload () {
            this.expectingFileUploadFinish = false;

            if (this.fileToUpload && this.fileReader) {
                this.fileReader.readAsArrayBuffer(this.fileToUpload);
            } else {
                this.props.cancelFileUpload(this.props.loadingState);
                this.removeFileObjects();
            }
        }

        // Get project title, always using configured save extension.

        getProjectTitleFromFilename (fileInputFilename) {
    if (!fileInputFilename) return '';

    // Remove the file extension.
    const filename = fileInputFilename.replace(/\.[^/.]+$/, '');

    // Limit project title to 100 characters.
    return filename.substring(0, 100);
}
        // Step 6: Load project data.
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

        // Step 7: Clean up temporary objects.
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
        showOpenFilePicker: null
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
