import React from 'react';
import {FormattedMessage, injectIntl, intlShape, defineMessages} from 'react-intl';
import {connect} from 'react-redux';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import bindAll from 'lodash.bindall';
import styles from './loader.css';
import {getIsLoadingWithId} from '../../reducers/project-state';
import topBlock from './top-block.svg';
import middleBlock from './middle-block.svg';
import bottomBlock from './bottom-block.svg';

const tips = [
    "Tip: Never Give Up!",
    "Fact: CattyMod was originally called Automate.",
    "Fact: CattyMod is maintained by only 1 developer!",
    "Tip: Go to the bottom of the page to see cool projects!",
    "Fact: CattyMod has 100+ preset blocks!",
    "Tip: Use Extensions to add abilities to your project!",
    "Fact: CattyMod was created on July 6th 2025!",
    "Tip: Share your projects on CattyMod Community!",
    "Fact: Dango has the colors Pink, Red and Blue!",
    "Tip: Every great project starts with an idea!",
    "Tip: Don't be afraid to experiment with new things!",
    "Tip: Mistakes are just opportunities to learn!",
    "Tip: Keep creating, even when things get difficult!",
    "Tip: Your creativity has no limits!",
    "Tip: Take inspiration from other projects, but make them your own!",
    "Tip: Small improvements can lead to amazing results!",
    "Tip: Challenge yourself to learn something new every day!",
    "Tip: Don't compare your progress to others. Focus on improving!",
    "Tip: Believe in your ideas, even if they seem impossible!",
    "Tip: The best way to improve is to keep practicing!",
    "Tip: Make projects that YOU enjoy creating!",
    "Tip: Don't let a lack of experience stop you from trying!",
    "Tip: Turn your imagination into something real!",

    "Fact: There are exactly 24 Facts and Tips including this one!"
];

let usedTips = [];

const chooseTip = () => {
    if (usedTips.length === tips.length) {
        usedTips = [];
    }

    const remainingTips = tips.filter(tip => !usedTips.includes(tip));
    const i = Math.floor(Math.random() * remainingTips.length);
    const tip = remainingTips[i];

    usedTips.push(tip);

    return tip;
};

// Returns true when CattyMod is running inside an iframe.
const isInIframe = () => {
    try {
        return window.self !== window.top;
    } catch (e) {
        // If window.top cannot be accessed, assume we are inside an iframe.
        return true;
    }
};

const mainMessages = {
    'gui.loader.headline': (
        <FormattedMessage
            defaultMessage="Loading Project"
            description="Main loading message"
            id="gui.loader.headline"
        />
    ),
    'gui.loader.creating': (
        <FormattedMessage
            defaultMessage="Creating Project"
            description="Main creating message"
            id="gui.loader.creating"
        />
    )
};

const messages = defineMessages({
    projectData: {
        defaultMessage: 'Loading project …',
        description: 'Appears when loading project data, but not assets yet',
        id: 'tw.loader.projectData'
    },
    downloadingAssets: {
        defaultMessage: 'Downloading assets ({complete}/{total}) …',
        description: 'Appears when loading project assets from a project on a remote website',
        id: 'tw.loader.downloadingAssets'
    },
    loadingAssets: {
        defaultMessage: 'Loading assets ({complete}/{total}) …',
        description: 'Appears when loading project assets from a project file on the user\'s computer',
        id: 'tw.loader.loadingAssets'
    }
});

// Because progress events are fired so often during the very performance-critical loading
// process and React updates are very slow, we bypass React for updating the progress bar.

class LoaderComponent extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleAssetProgress',
            'handleProjectLoaded',
            'barInnerRef',
            'messageRef'
        ]);

        this.barInnerEl = null;
        this.messageEl = null;
        this.ignoreProgress = false;

        // Only choose a tip when we are not inside an iframe.
        this.tip = isInIframe() ? null : chooseTip();
    }

    componentDidMount () {
        this.handleAssetProgress(
            this.props.vm.runtime.finishedAssetRequests,
            this.props.vm.runtime.totalAssetRequests
        );

        this.props.vm.on('ASSET_PROGRESS', this.handleAssetProgress);
        this.props.vm.runtime.on('PROJECT_LOADED', this.handleProjectLoaded);
    }

    componentWillUnmount () {
        this.props.vm.off('ASSET_PROGRESS', this.handleAssetProgress);
        this.props.vm.runtime.off('PROJECT_LOADED', this.handleProjectLoaded);
    }

    handleAssetProgress (finished, total) {
        if (this.ignoreProgress || !this.barInnerEl || !this.messageEl) {
            return;
        }

        if (total === 0) {
            // Started loading a new project.
            this.barInnerEl.style.width = '0';
            this.messageEl.textContent = this.props.intl.formatMessage(messages.projectData);
        } else {
            this.barInnerEl.style.width = `${finished / total * 100}%`;

            const message = this.props.isRemote ?
                messages.downloadingAssets :
                messages.loadingAssets;

            this.messageEl.textContent = this.props.intl.formatMessage(message, {
                complete: finished,
                total
            });
        }
    }

    handleProjectLoaded () {
        if (this.ignoreProgress || !this.barInnerEl || !this.messageEl) {
            return;
        }

        this.ignoreProgress = true;
        this.props.vm.runtime.resetProgress();
    }

    barInnerRef (barInner) {
        this.barInnerEl = barInner;
    }

    messageRef (message) {
        this.messageEl = message;
    }

    render () {
        const tipParts = this.tip ? this.tip.split(':') : [];
        const tipTitle = tipParts[0];
        const tipText = tipParts.slice(1).join(':').trim();

        return (
            <div
                className={classNames(styles.background, {
                    [styles.fullscreen]: this.props.isFullScreen
                })}
            >
                <div className={styles.container}>
                    <div className={styles.blockAnimation}>
                        <img
                            className={styles.topBlock}
                            src={topBlock}
                            draggable={false}
                        />

                        <img
                            className={styles.middleBlock}
                            src={middleBlock}
                            draggable={false}
                        />

                        <img
                            className={styles.bottomBlock}
                            src={bottomBlock}
                            draggable={false}
                        />
                    </div>

                    <div className={styles.title}>
                        {mainMessages[this.props.messageId]}
                    </div>

                    <div
                        className={styles.message}
                        ref={this.messageRef}
                    />

                    <div className={styles.barOuter}>
                        <div
                            className={styles.barInner}
                            ref={this.barInnerRef}
                        />
                    </div>

                    {!isInIframe() && (
                        <div
                            style={{
                                color: 'white',
                                marginTop: '8px',
                                textAlign: 'center',
                                pointerEvents: 'none'
                            }}
                        >
                            {tipTitle}:{' '}
                            <i>{tipText}</i>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

LoaderComponent.propTypes = {
    intl: intlShape,
    isFullScreen: PropTypes.bool,
    isRemote: PropTypes.bool,
    messageId: PropTypes.string,
    vm: PropTypes.shape({
        on: PropTypes.func,
        off: PropTypes.func,
        runtime: PropTypes.shape({
            totalAssetRequests: PropTypes.number,
            finishedAssetRequests: PropTypes.number,
            resetProgress: PropTypes.func,
            on: PropTypes.func,
            off: PropTypes.func
        })
    })
};

LoaderComponent.defaultProps = {
    isFullScreen: false,
    messageId: 'gui.loader.headline'
};

const mapStateToProps = state => ({
    isRemote: getIsLoadingWithId(state.scratchGui.projectState.loadingState),
    vm: state.scratchGui.vm
});

const mapDispatchToProps = () => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(injectIntl(LoaderComponent));
