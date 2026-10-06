import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import VM from 'scratch-vm';
import {getIsError} from '../reducers/project-state';
import {ProjectUnsharedError, ProjectFetchError} from '../lib/tw-load-project-error';

// Dummy implementation.
// This intentionally does not make any network requests.
const submittedViewsThisSession = new Set();
const submittedErrorsThisSession = new Set();

const getErrorEvent = error => {
    if (error instanceof ProjectUnsharedError) {
        return 'error/unshared';
    }
    if (error instanceof ProjectFetchError) {
        return 'error/fetch';
    }
    return 'error/loading';
};

// Kept as a function so the existing event flow/API does not break.
// It intentionally does nothing.
const submitChime = async (resource, event) => {
    // Dummy: no Windchimes request is made.
    // Keep the arguments so callers do not need to change.
    void resource;
    void event;
};

const isEligible = projectId => projectId !== '0' && projectId !== null;

const submitOnce = (submitted, projectId, event) => {
    if (!isEligible(projectId) || submitted.has(projectId)) {
        return;
    }

    submitted.add(projectId);
    submitChime(`scratch/${projectId}`, event);
};

class TWWindchimeSubmitter extends React.Component {
    constructor (props) {
        super(props);
        this.handleContextLost = this.handleContextLost.bind(this);
        this.handleCompileError = this.handleCompileError.bind(this);
    }

    componentDidMount () {
        const vm = this.props.vm;

        vm.on('COMPILE_ERROR', this.handleCompileError);

        if (vm.renderer) {
            vm.renderer.on('ContextLost', this.handleContextLost);
        }
    }

    componentDidUpdate (prevProps) {
        if (this.props.isStarted && !prevProps.isStarted) {
            submitOnce(
                submittedViewsThisSession,
                this.props.projectId,
                this.props.isEmbedded ? 'view/embed' : 'view/index'
            );
        }

        if (this.props.isError && !prevProps.isError) {
            submitOnce(
                submittedErrorsThisSession,
                this.props.projectId,
                getErrorEvent(this.props.error)
            );
        }
    }

    componentWillUnmount () {
        const vm = this.props.vm;

        vm.off('COMPILE_ERROR', this.handleCompileError);

        if (vm.renderer) {
            vm.renderer.off('ContextLost', this.handleContextLost);
        }
    }

    handleCompileError () {
        submitOnce(
            submittedErrorsThisSession,
            this.props.projectId,
            'error/compiler'
        );
    }

    handleContextLost () {
        submitOnce(
            submittedErrorsThisSession,
            this.props.projectId,
            'error/webgl'
        );
    }

    render () {
        return null;
    }
}

TWWindchimeSubmitter.propTypes = {
    error: PropTypes.any,
    isEmbedded: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool.isRequired,
    projectId: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    error: state.scratchGui.projectState.error,
    isEmbedded: state.scratchGui.mode.isEmbedded,
    isStarted: state.scratchGui.vmStatus.running,
    isError: getIsError(state.scratchGui.projectState.loadingState),
    projectId: state.scratchGui.projectState.projectId,
    vm: state.scratchGui.vm
});

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TWWindchimeSubmitter);
