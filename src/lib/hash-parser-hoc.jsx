import bindAll from 'lodash.bindall';
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

import {
    getIsFetchingWithoutId,
    setProjectId
} from '../reducers/project-state';

/*
 * Higher Order Component to get the project id from location.hash
 * Supports:
 * /
 * /editor#PROJECT_ID
 * /fullscreen#PROJECT_ID
 *
 * @param {React.Component} WrappedComponent: component to render
 * @returns {React.Component} component with hash parsing behavior
 */
const HashParserHOC = function (WrappedComponent) {
    class HashParserComponent extends React.Component {
        constructor (props) {
            super(props);

            bindAll(this, [
                'handleHashChange',
                'handlePathChange'
            ]);
        }

        componentDidMount () {
            window.addEventListener('hashchange', this.handleHashChange);
            window.addEventListener('popstate', this.handlePathChange);

            this.handlePathChange();
        }

        componentDidUpdate (prevProps) {
            // If we are newly fetching a non-hash project,
            // remove the hash instead of creating #0
            if (this.props.isFetchingWithoutId && !prevProps.isFetchingWithoutId) {
                history.replaceState(
                    'new-project',
                    'new-project',
                    window.location.pathname + window.location.search
                );
            }

            // Keep URL hash synced with project ID
            if (this.props.reduxProjectId !== prevProps.reduxProjectId) {
                const id = this.props.reduxProjectId;

                if (id && id !== '0') {
                    if (window.location.hash !== `#${id}`) {
                        history.replaceState(
                            null,
                            '',
                            `${window.location.pathname}${window.location.search}#${id}`
                        );
                    }
                } else if (window.location.hash === '#0') {
                    history.replaceState(
                        null,
                        '',
                        window.location.pathname + window.location.search
                    );
                }
            }
        }

        componentWillUnmount () {
            window.removeEventListener('hashchange', this.handleHashChange);
            window.removeEventListener('popstate', this.handlePathChange);
        }

        handlePathChange () {
            const path = window.location.pathname;

            // Allow only these routes
            if (
                path === '/' ||
                path === '/editor' ||
                path === '/fullscreen'
            ) {
                this.handleHashChange();
            }
        }

        handleHashChange () {
            const hashMatch = window.location.hash.match(/#(\d+)/);

            if (!hashMatch || hashMatch[1] === '0') {
                this.props.setProjectId(null);
                return;
            }

            this.props.setProjectId(hashMatch[1].toString());
        }

        render () {
            const {
                /* eslint-disable no-unused-vars */
                isFetchingWithoutId: isFetchingWithoutIdProp,
                reduxProjectId,
                setProjectId: setProjectIdProp,
                /* eslint-enable no-unused-vars */
                ...componentProps
            } = this.props;

            return (
                <WrappedComponent
                    {...componentProps}
                />
            );
        }
    }

    HashParserComponent.propTypes = {
        isFetchingWithoutId: PropTypes.bool,
        reduxProjectId: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number
        ]),
        setProjectId: PropTypes.func
    };

    const mapStateToProps = state => {
        const loadingState = state.scratchGui.projectState.loadingState;

        return {
            isFetchingWithoutId: getIsFetchingWithoutId(loadingState),
            reduxProjectId: state.scratchGui.projectState.projectId
        };
    };

    const mapDispatchToProps = dispatch => ({
        setProjectId: projectId => {
            dispatch(setProjectId(projectId));
        }
    });

    const mergeProps = (stateProps, dispatchProps, ownProps) => Object.assign(
        {},
        stateProps,
        dispatchProps,
        ownProps
    );

    return connect(
        mapStateToProps,
        mapDispatchToProps,
        mergeProps
    )(HashParserComponent);
};

export {
    HashParserHOC as default
};
