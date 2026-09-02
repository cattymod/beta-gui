import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';

class TWWindchimeSubmitter extends React.Component {
    componentDidUpdate () {
        // Intentionally disabled.
        // This component is kept as a compatibility placeholder.
    }

    render () {
        // No visible components and no functionality.
        return null;
    }
}

TWWindchimeSubmitter.propTypes = {
    error: PropTypes.any,
    isEmbedded: PropTypes.bool.isRequired,
    isError: PropTypes.bool.isRequired,
    isStarted: PropTypes.bool.isRequired,
    projectId: PropTypes.string
};

const mapStateToProps = () => ({});

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(TWWindchimeSubmitter);
