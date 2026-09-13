import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {GUI_DARK} from '../../lib/themes/index.js';
import styles from './mobile-controls.css';

class MobileControls extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            joystickDirections: [],
            joystickActive: false
        };

        this.keyboardInputRef = React.createRef();
        this.joystickAreaRef = React.createRef();
        this.joystickRef = React.createRef();
    }

    componentWillUnmount() {
        this.releaseJoystickKeys();
    }

    /*
     * Keyboard input
     */

    pressKey = key => {
        const {vm} = this.props;

        if (!vm) {
            return;
        }

        vm.postIOData('keyboard', {
            key,
            isDown: true
        });
    };

    releaseKey = key => {
        const {vm} = this.props;

        if (!vm) {
            return;
        }

        vm.postIOData('keyboard', {
            key,
            isDown: false
        });
    };

    tapKey = key => {
        this.pressKey(key);

        window.setTimeout(() => {
            this.releaseKey(key);
        }, 50);
    };

    handleKeyboardKeyDown = event => {
        event.preventDefault();

        this.pressKey(event.key);
    };

    handleKeyboardKeyUp = event => {
        event.preventDefault();

        this.releaseKey(event.key);
    };

    handleKeyboardPointerDown = event => {
        event.preventDefault();

        const input = event.currentTarget;

        input.scrollIntoView = () => {};

        input.focus({
            preventScroll: true
        });
    };

    /*
     * Buttons
     */

    handleButtonPointerDown = (key, event) => {
        event.preventDefault();

        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.classList.add(styles.pressed);

        this.pressKey(key);
    };

    handleButtonPointerUp = (key, event) => {
        event.preventDefault();

        event.currentTarget.classList.remove(styles.pressed);

        this.releaseKey(key);
    };

    handleButtonPointerCancel = (key, event) => {
        event.preventDefault();

        event.currentTarget.classList.remove(styles.pressed);

        this.releaseKey(key);
    };

    handleButtonLostPointerCapture = (key, event) => {
        event.currentTarget.classList.remove(styles.pressed);

        this.releaseKey(key);
    };

    renderButton = (label, key, sublabel = null, extraClass = '') => (
        <button
            type="button"
            className={`${styles.button} ${extraClass}`}
            onPointerDown={event => this.handleButtonPointerDown(key, event)}
            onPointerUp={event => this.handleButtonPointerUp(key, event)}
            onPointerCancel={event => this.handleButtonPointerCancel(key, event)}
            onLostPointerCapture={event => this.handleButtonLostPointerCapture(key, event)}
        >
            <span className={styles.label}>
                {label}
            </span>

            {sublabel ? (
                <span className={styles.sublabel}>
                    {sublabel}
                </span>
            ) : null}
        </button>
    );

    /*
     * Joystick direction
     *
     * Returns one or two directions.
     *
     * Examples:
     *   up       -> ['up']
     *   right    -> ['right']
     *   up-right -> ['up', 'right']
     */

    getJoystickDirections = (x, y) => {
        const deadZone = 12;

        if (Math.abs(x) < deadZone && Math.abs(y) < deadZone) {
            return [];
        }

        const angle = Math.atan2(y, x) * (180 / Math.PI);

        /*
         * The joystick uses:
         *
         *   x > 0 = right
         *   x < 0 = left
         *   y > 0 = down
         *   y < 0 = up
         *
         * A diagonal is allowed when the joystick is
         * roughly 22.5 degrees away from the diagonal.
         */

        if (angle >= -22.5 && angle < 22.5) {
            return ['right'];
        }

        if (angle >= 22.5 && angle < 67.5) {
            return ['down', 'right'];
        }

        if (angle >= 67.5 && angle < 112.5) {
            return ['down'];
        }

        if (angle >= 112.5 && angle < 157.5) {
            return ['down', 'left'];
        }

        if (angle >= 157.5 || angle < -157.5) {
            return ['left'];
        }

        if (angle >= -157.5 && angle < -112.5) {
            return ['up', 'left'];
        }

        if (angle >= -112.5 && angle < -67.5) {
            return ['up'];
        }

        return ['up', 'right'];
    };

    getJoystickKey = direction => {
        switch (direction) {
        case 'up':
            return 'ArrowUp';

        case 'right':
            return 'ArrowRight';

        case 'down':
            return 'ArrowDown';

        case 'left':
            return 'ArrowLeft';

        default:
            return null;
        }
    };

    setJoystickDirections = directions => {
        const oldDirections = this.state.joystickDirections;

        /*
         * Release directions that are no longer active.
         */
        for (const direction of oldDirections) {
            if (!directions.includes(direction)) {
                const key = this.getJoystickKey(direction);

                if (key) {
                    this.releaseKey(key);
                }
            }
        }

        /*
         * Press newly active directions.
         */
        for (const direction of directions) {
            if (!oldDirections.includes(direction)) {
                const key = this.getJoystickKey(direction);

                if (key) {
                    this.pressKey(key);
                }
            }
        }

        this.setState({
            joystickDirections: directions
        });
    };

    releaseJoystickKeys = () => {
        const {joystickDirections} = this.state;

        for (const direction of joystickDirections) {
            const key = this.getJoystickKey(direction);

            if (key) {
                this.releaseKey(key);
            }
        }

        this.setState({
            joystickDirections: []
        });
    };

    /*
     * Joystick movement
     */

    moveJoystick = event => {
        if (!this.joystickAreaRef.current) {
            return;
        }

        const rect = this.joystickAreaRef.current.getBoundingClientRect();

        const centerX = rect.left + (rect.width / 2);
        const centerY = rect.top + (rect.height / 2);

        let x = event.clientX - centerX;
        let y = event.clientY - centerY;

        const maxDistance = 27;
        const distance = Math.sqrt((x * x) + (y * y));

        if (distance > maxDistance) {
            const scale = maxDistance / distance;

            x *= scale;
            y *= scale;
        }

        if (this.joystickRef.current) {
            this.joystickRef.current.style.setProperty(
                '--joystick-x',
                `${x}px`
            );

            this.joystickRef.current.style.setProperty(
                '--joystick-y',
                `${y}px`
            );
        }

        this.setJoystickDirections(
            this.getJoystickDirections(x, y)
        );
    };

    handleJoystickPointerDown = event => {
        event.preventDefault();

        event.currentTarget.setPointerCapture(event.pointerId);

        this.setState({
            joystickActive: true
        });

        this.moveJoystick(event);
    };

    handleJoystickPointerMove = event => {
        if (!this.state.joystickActive) {
            return;
        }

        event.preventDefault();

        this.moveJoystick(event);
    };

    handleJoystickPointerUp = event => {
        event.preventDefault();

        this.setState({
            joystickActive: false
        });

        if (this.joystickRef.current) {
            this.joystickRef.current.style.setProperty(
                '--joystick-x',
                '0px'
            );

            this.joystickRef.current.style.setProperty(
                '--joystick-y',
                '0px'
            );
        }

        this.releaseJoystickKeys();
    };

    render() {
        const {
            theme
        } = this.props;

        const isDark = theme.gui === GUI_DARK;

        return (
            <div
                className={`${styles.mobileControls} ${
                    isDark ? styles.dark : styles.light
                }`}
            >
                <div className={styles.controls}>
                    <input
                        ref={this.keyboardInputRef}
                        className={styles.keyboardInput}
                        type="text"
                        placeholder="Use your Keyboard"
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        inputMode="text"
                        onKeyDown={this.handleKeyboardKeyDown}
                        onKeyUp={this.handleKeyboardKeyUp}
                        onPointerDown={this.handleKeyboardPointerDown}
                        aria-label="Use your Keyboard"
                    />

                    <div className={styles.gameboyControls}>
                        <div className={styles.dpad}>
                            <div className={styles.dpadTop}>
                                {this.renderButton(
                                    '↑',
                                    'ArrowUp'
                                )}
                            </div>

                            <div className={styles.dpadMiddle}>
                                {this.renderButton(
                                    '←',
                                    'ArrowLeft'
                                )}

                                <div
                                    ref={this.joystickAreaRef}
                                    className={styles.joystickArea}
                                    onPointerDown={this.handleJoystickPointerDown}
                                    onPointerMove={this.handleJoystickPointerMove}
                                    onPointerUp={this.handleJoystickPointerUp}
                                    onPointerCancel={this.handleJoystickPointerUp}
                                    onLostPointerCapture={this.handleJoystickPointerUp}
                                >
                                    <div
                                        ref={this.joystickRef}
                                        className={styles.joystick}
                                    />
                                </div>

                                {this.renderButton(
                                    '→',
                                    'ArrowRight'
                                )}
                            </div>

                            <div className={styles.dpadBottom}>
                                {this.renderButton(
                                    '↓',
                                    'ArrowDown'
                                )}
                            </div>
                        </div>

                        <div className={styles.abcd}>
                            {this.renderButton(
                                'A',
                                ' ',
                                'Space'
                            )}

                            {this.renderButton(
                                'B',
                                'Enter',
                                'Enter'
                            )}

                            {this.renderButton(
                                'C',
                                'z',
                                'Z'
                            )}

                            {this.renderButton(
                                'D',
                                'x',
                                'X'
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

MobileControls.propTypes = {
    vm: PropTypes.object,
    theme: PropTypes.object
};

const mapStateToProps = state => ({
    theme: state.scratchGui.theme.theme
});

export default connect(mapStateToProps)(MobileControls);
