import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {projectTitleInitialState, setProjectTitle} from '../reducers/project-title';
import downloadBlob from '../lib/download-blob';
import {setProjectUnchanged} from '../reducers/project-changed';
import {showStandardAlert, showAlertWithTimeout} from '../reducers/alerts';
import {setFileHandle} from '../reducers/tw';
import {getIsShowingProject} from '../reducers/project-state';
import log from '../lib/log';

// from sb-file-uploader-hoc.jsx
const getProjectTitleFromFilename = fileInputFilename => {
    if (!fileInputFilename) return '';

    const matches = fileInputFilename.match(
        /^(.*)\.(?:cmp|zip|pmp|snail|sb3|sb2|sb)$/i
    );

    if (!matches) return '';

    return matches[1].substring(0, 100);
};

/**
 * @param {Uint8Array[]} arrays List of byte arrays
 * @returns {number} Total length of the arrays
 */
const getLengthOfByteArrays = arrays => {
    let length = 0;
    for (let i = 0; i < arrays.length; i++) {
        length += arrays[i].byteLength;
    }
    return length;
};

/**
 * @param {Uint8Array[]} arrays List of byte arrays
 * @returns {Uint8Array} One big array containing all of the little arrays in order.
 */
const concatenateByteArrays = arrays => {
    const totalLength = getLengthOfByteArrays(arrays);
    const newArray = new Uint8Array(totalLength);
    let p = 0;
    for (let i = 0; i < arrays.length; i++) {
        newArray.set(arrays[i], p);
        p += arrays[i].byteLength;
    }
    return newArray;
};

/**
 * CattyMod Project saver component passes a downloadProject function to its child.
 */
class SB3Downloader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'downloadProject',
            'saveAsNew',
            'saveToLastFile',
            'saveToLastFileOrNew'
        ]);
    }

    startedSaving () {
        this.props.onShowSavingAlert();
    }

    finishedSaving () {
        this.props.onProjectUnchanged();
        this.props.onShowSaveSuccessAlert();
        if (this.props.onSaveFinished) {
            this.props.onSaveFinished();
        }
    }

    downloadProject () {
        if (!this.props.canSaveProject) {
            return;
        }
        this.startedSaving();
        this.props.saveProjectSb3().then(content => {
            this.finishedSaving();
            downloadBlob(this.props.projectFilename, content);
        });
    }

    async saveAsNew () {
        if (!this.props.canSaveProject) {
            return;
        }
        try {
            const fileType = getPreferredFileType();
            const handle = await this.props.showSaveFilePicker({
                suggestedName: this.props.projectFilename,
                types: [
                    {
                        description: ({
                            cmp: 'CattyMod Project',
                            sb3: 'Scratch Project',
                            pmp: 'PenguinMod Project',
                            snail: 'Snail IDE Project',
                            zip: 'Generic Project'
                        })[fileType] || 'CattyMod Project',
                        accept: {
                            'application/octet-stream': [
                                `.${fileType}`
                            ]
                        }
                    }
                ],
                excludeAcceptAllOption: true
            });
            await this.saveToHandle(handle);
            this.props.onSetFileHandle(handle);
            const title = getProjectTitleFromFilename(handle.name);
            if (title) {
                this.props.onSetProjectTitle(title);
            }
        } catch (e) {
            this.handleSaveError(e);
        }
    }

    async saveToLastFile () {
        try {
            await this.saveToHandle(this.props.fileHandle);
        } catch (e) {
            this.handleSaveError(e);
        }
    }

saveToLastFileOrNew () {
    const preferredType = getPreferredFileType();
    const currentName = this.props.fileHandle ?
        this.props.fileHandle.name : '';

    const currentExtension = currentName.match(/\.(cmp|pmp|snail|sb3|zip)$/i);

    if (
        this.props.fileHandle &&
        currentExtension &&
        currentExtension[1].toLowerCase() === preferredType
    ) {
        return this.saveToLastFile();
    }

    return this.saveAsNew();
}

    async saveToHandle (handle) {
        if (!this.props.canSaveProject) {
            return;
        }

        const writable = await handle.createWritable();
        this.startedSaving();

        await new Promise((resolve, reject) => {
            const jszipStream = this.props.saveProjectSb3Stream();

            const abortController = new AbortController();
            jszipStream.on('error', error => {
                abortController.abort(error);
            });

            let jszipStreamRunning = false;
            const pauseJSZipStream = () => {
                if (jszipStreamRunning) {
                    jszipStreamRunning = false;
                    jszipStream.pause();
                }
            };
            const resumeJSZipStream = () => {
                if (!jszipStreamRunning) {
                    jszipStreamRunning = true;
                    jszipStream.resume();
                }
            };

            const HIGH_WATER_MARK_BYTES = 1024 * 1024 * 5;
            const WRITE_BUFFER_TARGET_SIZE_BYTES = 1024 * 1024;

            const zipStream = new ReadableStream({
                start: controller => {
                    jszipStream.on('data', data => {
                        controller.enqueue(data);
                        if (controller.desiredSize <= 0) {
                            pauseJSZipStream();
                        }
                    });
                    jszipStream.on('end', () => {
                        controller.close();
                    });
                    resumeJSZipStream();
                },
                pull: () => {
                    resumeJSZipStream();
                },
                cancel: () => {
                    pauseJSZipStream();
                }
            }, new ByteLengthQueuingStrategy({
                highWaterMark: HIGH_WATER_MARK_BYTES
            }));

            const queuedChunks = [];
            const fileStream = new WritableStream({
                write: chunk => {
                    queuedChunks.push(chunk);
                    const currentSize = getLengthOfByteArrays(queuedChunks);
                    if (currentSize >= WRITE_BUFFER_TARGET_SIZE_BYTES) {
                        const newBuffer = concatenateByteArrays(queuedChunks);
                        queuedChunks.length = 0;
                        return writable.write(newBuffer);
                    }
                },
                close: async () => {
                    const lastBuffer = concatenateByteArrays(queuedChunks);
                    if (lastBuffer.byteLength) {
                        await writable.write(lastBuffer);
                    }
                    await writable.close();
                },
                abort: async () => {
                    await writable.abort();
                }
            });

            zipStream.pipeTo(fileStream, {
                signal: abortController.signal
            })
                .then(() => {
                    this.finishedSaving();
                    resolve();
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    handleSaveError (e) {
        if (e && e.name === 'AbortError') {
            return;
        }
        log.error(e);
        this.props.onShowSaveErrorAlert();
    }

    render () {
        const {
            children
        } = this.props;
        return children(
            this.props.className,
            this.downloadProject,
            this.props.showSaveFilePicker ? {
                available: true,
                name: this.props.fileHandle ? this.props.fileHandle.name : null,
                saveAsNew: this.saveAsNew,
                saveToLastFile: this.saveToLastFile,
                saveToLastFileOrNew: this.saveToLastFileOrNew,
                smartSave: this.saveToLastFileOrNew
            } : {
                available: false,
                smartSave: this.downloadProject
            }
        );
    }
}

const getPreferredFileType = () => {
    const validTypes = ['cmp', 'pmp', 'snail', 'sb3', 'zip'];
    const savedType = localStorage.getItem('cattymod:saveFileType');

    return validTypes.includes(savedType) ? savedType : 'cmp';
};


const getProjectFilename = (curTitle, defaultTitle) => {
    let filenameTitle = curTitle;

    if (!filenameTitle || filenameTitle.length === 0) {
        filenameTitle = defaultTitle;
    }

    const fileType = getPreferredFileType();

    // Remove an existing supported project extension.
    filenameTitle = filenameTitle.replace(
        /\.(?:cmp|zip|pmp|snail|sb3|sb2|sb)$/i,
        ''
    );

    return `${filenameTitle.substring(0, 100)}.${fileType}`;
};


SB3Downloader.propTypes = {
    children: PropTypes.func,
    className: PropTypes.string,
    fileHandle: PropTypes.shape({
        name: PropTypes.string
    }),
    onSaveFinished: PropTypes.func,
    projectFilename: PropTypes.string,
    saveProjectSb3: PropTypes.func,
    saveProjectSb3Stream: PropTypes.func,
    canSaveProject: PropTypes.bool,
    onSetFileHandle: PropTypes.func,
    onSetProjectTitle: PropTypes.func,
    onShowSavingAlert: PropTypes.func,
    onShowSaveSuccessAlert: PropTypes.func,
    onShowSaveErrorAlert: PropTypes.func,
    onProjectUnchanged: PropTypes.func,
    showSaveFilePicker: PropTypes.func
};

SB3Downloader.defaultProps = {
    className: '',
    showSaveFilePicker: typeof showSaveFilePicker === 'function' && !navigator.userAgent.includes('Android') ?
        window.showSaveFilePicker.bind(window) :
        null
};

const mapStateToProps = state => ({
    fileHandle: state.scratchGui.tw.fileHandle,
    saveProjectSb3: state.scratchGui.vm.saveProjectSb3.bind(state.scratchGui.vm),
    saveProjectSb3Stream: state.scratchGui.vm.saveProjectSb3Stream.bind(state.scratchGui.vm),
    canSaveProject: getIsShowingProject(state.scratchGui.projectState.loadingState),
    projectFilename: getProjectFilename(state.scratchGui.projectTitle, projectTitleInitialState)
});

const mapDispatchToProps = dispatch => ({
    onSetFileHandle: fileHandle => dispatch(setFileHandle(fileHandle)),
    onSetProjectTitle: title => dispatch(setProjectTitle(title)),
    onShowSavingAlert: () => showAlertWithTimeout(dispatch, 'saving'),
    onShowSaveSuccessAlert: () => showAlertWithTimeout(dispatch, 'twSaveToDiskSuccess'),
    onShowSaveErrorAlert: () => dispatch(showStandardAlert('savingError')),
    onProjectUnchanged: () => dispatch(setProjectUnchanged())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(SB3Downloader);
