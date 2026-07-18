import PropTypes from 'prop-types';
import React from 'react';
import bindAll from 'lodash.bindall';
import VM from 'scratch-vm';
import {STAGE_DISPLAY_SCALE_METADATA, STAGE_DISPLAY_SIZES, STAGE_SIZE_MODES} from '../lib/layout-constants';
import {setStageSize} from '../reducers/stage-size';
import {setFullScreen} from '../reducers/mode';
import {openSettingsModal} from '../reducers/modals';

import {connect} from 'react-redux';

import StageHeaderComponent from '../components/stage-header/stage-header.jsx';

// eslint-disable-next-line react/prefer-stateless-function
class StageHeader extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleKeyPress'
        ]);
        this.checkInvalidStageSizeMode();
    }

    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyPress);
    }

    componentDidUpdate () {
        this.checkInvalidStageSizeMode();
    }

    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyPress);
    }

    handleKeyPress (event) {
        if (event.key === 'Escape' && this.props.isFullScreen) {
            this.props.onSetStageUnFullScreen();
        }
    }

    checkInvalidStageSizeMode () {
        if (this.props.stageSizeMode === STAGE_SIZE_MODES.large && !this.showFixedLargeSize()) {
            this.props.onSetStageFull();
        }
    }

    showFixedLargeSize () {
        const constrainedScale = STAGE_DISPLAY_SCALE_METADATA[STAGE_DISPLAY_SIZES.constrained].scale;
        const constrainedWidth = this.props.customStageSize.width * constrainedScale;
        const largeWidth = STAGE_DISPLAY_SCALE_METADATA[STAGE_DISPLAY_SIZES.large].width;

        return constrainedWidth > largeWidth;
    }

    render () {
        const {
            ...props
        } = this.props;

        return (
            <StageHeaderComponent
                {...props}
                onKeyPress={this.handleKeyPress}
                showFixedLargeSize={this.showFixedLargeSize()}
            />
        );
    }
}

StageHeader.propTypes = {
    isFullScreen: PropTypes.bool.isRequired,
    isWindowFullScreen: PropTypes.bool.isRequired,
    customStageSize: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    }).isRequired,
    dimensions: PropTypes.arrayOf(PropTypes.number),
    isPlayerOnly: PropTypes.bool,
    onSetStageUnFullScreen: PropTypes.func.isRequired,
    onSetStageFull: PropTypes.func.isRequired,
    onOpenSettings: PropTypes.func.isRequired,
    isEmbedded: PropTypes.bool.isRequired,
    stageSizeMode: PropTypes.oneOf(Object.keys(STAGE_SIZE_MODES)).isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    customStageSize: state.scratchGui.customStageSize,
    stageSizeMode: state.scratchGui.stageSize.stageSize,
    isEmbedded: state.scratchGui.mode.isEmbedded,
    isFullScreen: state.scratchGui.mode.isFullScreen,
    isWindowFullScreen: state.scratchGui.tw.isWindowFullScreen,
    dimensions: state.scratchGui.tw.dimensions,
    isPlayerOnly: state.scratchGui.mode.isPlayerOnly
});

const mapDispatchToProps = dispatch => ({
    onSetStageLarge: () => dispatch(setStageSize(STAGE_SIZE_MODES.large)),

    onSetStageSmall: () => dispatch(setStageSize(STAGE_SIZE_MODES.small)),

    onSetStageFull: () => dispatch(setStageSize(STAGE_SIZE_MODES.full)),

    onSetStageFullScreen: () => {
        history.pushState(
            {},
            '',
            `/fullscreen${window.location.hash}`
        );

        dispatch(setFullScreen(true));
    },

    onSetStageUnFullScreen: () => {
        history.pushState(
            {},
            '',
            `/editor${window.location.hash}`
        );

        dispatch(setFullScreen(false));
    },

    onOpenSettings: () => dispatch(openSettingsModal())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(StageHeader);
