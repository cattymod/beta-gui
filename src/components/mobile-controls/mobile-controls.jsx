import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import {GUI_DARK} from '../../lib/themes/index.js';
import styles from './mobile-controls.css';

class MobileControls extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            controlMode: 'gamepad',
            joystickDirections: [],
            joystickActive: false
        };

        this.joystickAreaRef = React.createRef();
        this.joystickRef = React.createRef();

        /*
         * Keys currently held by the custom keyboard.
         *
         * This is intentionally kept outside React state because
         * key presses do not need to cause a component re-render.
         */
        this.keyboardKeys = new Set();
    }

    componentWillUnmount() {
        this.releaseKeyboardKeys();
        this.releaseJoystickKeys();
    }

    /*
     * Keyboard input
     */

    pressKey = key => {
        const {vm} = this.props;

        if (!vm || !key) {
            return;
        }

        vm.postIOData('keyboard', {
            key,
            isDown: true
        });
    };

    releaseKey = key => {
        const {vm} = this.props;

        if (!vm || !key) {
            return;
        }

        vm.postIOData('keyboard', {
            key,
            isDown: false
        });
    };

    /*
     * Custom keyboard
     */

    handleKeyboardKeyDown = (key, event) => {
        event.preventDefault();

        if (this.keyboardKeys.has(key)) {
            return;
        }

        this.keyboardKeys.add(key);

        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.classList.add(styles.pressed);

        this.pressKey(key);
    };

    handleKeyboardKeyUp = (key, event) => {
        event.preventDefault();

        this.releaseKeyboardKey(key, event.currentTarget);
    };

    handleKeyboardKeyCancel = (key, event) => {
        event.preventDefault();

        this.releaseKeyboardKey(key, event.currentTarget);
    };

    handleKeyboardKeyLostPointerCapture = (key, event) => {
        this.releaseKeyboardKey(key, event.currentTarget);
    };

    releaseKeyboardKey = (key, element = null) => {
        if (!this.keyboardKeys.has(key)) {
            return;
        }

        this.keyboardKeys.delete(key);

        if (element) {
            element.classList.remove(styles.pressed);
        }

        this.releaseKey(key);
    };

    releaseKeyboardKeys = () => {
        for (const key of this.keyboardKeys) {
            this.releaseKey(key);
        }

        this.keyboardKeys.clear();
    };

    /*
     * Switch between gamepad and keyboard.
     */

    toggleControlMode = event => {
        event.preventDefault();

        this.releaseKeyboardKeys();
        this.releaseJoystickKeys();

        this.setState(previousState => ({
            controlMode: previousState.controlMode === 'gamepad' ?
                'keyboard' :
                'gamepad',
            joystickActive: false
        }));

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
     * Custom keyboard button
     */

    renderKeyboardKey = (
        label,
        key,
        extraClass = ''
    ) => (
        <button
            type="button"
            className={`${styles.keyboardKey} ${extraClass}`}
            onPointerDown={event => this.handleKeyboardKeyDown(key, event)}
            onPointerUp={event => this.handleKeyboardKeyUp(key, event)}
            onPointerCancel={event => this.handleKeyboardKeyCancel(key, event)}
            onLostPointerCapture={
                event => this.handleKeyboardKeyLostPointerCapture(key, event)
            }
            aria-label={label}
        >
            {label}
        </button>
    );

    /*
     * Joystick
     */

    getJoystickDirections = (x, y) => {
        const deadZone = 12;

        if (Math.abs(x) < deadZone && Math.abs(y) < deadZone) {
            return [];
        }

        const angle = Math.atan2(y, x) * (180 / Math.PI);

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

    /*
     * Gamepad
     */

    renderGamepad = () => (
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
    );

    /*
     * Custom keyboard
     */

    renderKeyboard = () => (
        <div className={styles.keyboard}>
            <div className={styles.keyboardRow}>
                {[
                    ['Q', 'q'],
                    ['W', 'w'],
                    ['E', 'e'],
                    ['R', 'r'],
                    ['T', 't'],
                    ['Y', 'y'],
                    ['U', 'u'],
                    ['I', 'i'],
                    ['O', 'o'],
                    ['P', 'p']
                ].map(([label, key]) => (
                    <React.Fragment key={key}>
                        {this.renderKeyboardKey(label, key)}
                    </React.Fragment>
                ))}
            </div>

            <div className={styles.keyboardRow}>
                {[
                    ['A', 'a'],
                    ['S', 's'],
                    ['D', 'd'],
                    ['F', 'f'],
                    ['G', 'g'],
                    ['H', 'h'],
                    ['J', 'j'],
                    ['K', 'k'],
                    ['L', 'l']
                ].map(([label, key]) => (
                    <React.Fragment key={key}>
                        {this.renderKeyboardKey(label, key)}
                    </React.Fragment>
                ))}
            </div>

            <div className={styles.keyboardRow}>
                {[
                    ['Z', 'z'],
                    ['X', 'x'],
                    ['C', 'c'],
                    ['V', 'v'],
                    ['B', 'b'],
                    ['N', 'n'],
                    ['M', 'm']
                ].map(([label, key]) => (
                    <React.Fragment key={key}>
                        {this.renderKeyboardKey(label, key)}
                    </React.Fragment>
                ))}
            </div>

            <div className={styles.keyboardBottomRow}>
                {this.renderKeyboardKey(
                    'Space',
                    ' ',
                    styles.spaceKey
                )}

                {this.renderKeyboardKey(
                    'Enter',
                    'Enter',
                    styles.enterKey
                )}

                {this.renderKeyboardKey(
                    '←',
                    'ArrowLeft',
                    styles.arrowKey
                )}

                {this.renderKeyboardKey(
                    '↑',
                    'ArrowUp',
                    styles.arrowKey
                )}

                {this.renderKeyboardKey(
                    '↓',
                    'ArrowDown',
                    styles.arrowKey
                )}

                {this.renderKeyboardKey(
                    '→',
                    'ArrowRight',
                    styles.arrowKey
                )}
            </div>
        </div>
    );

    render() {
        const {
            theme
        } = this.props;

        const {
            controlMode
        } = this.state;

        const isDark = theme.gui === GUI_DARK;
        const isKeyboard = controlMode === 'keyboard';

        return (
            <div
                className={`${styles.mobileControls} ${
                    isDark ? styles.dark : styles.light
                }`}
            >
                <div className={styles.controls}>
                    <button
                        type="button"
                        className={styles.keyboardInput}
                        onPointerDown={this.toggleControlMode}
                        aria-label={
                            isKeyboard ?
                                'Switch to gamepad controls' :
                                'Switch to keyboard controls'
                        }
                    >
                        {isKeyboard ? 'Use Gamepad' : 'Use Keyboard'}
                    </button>

                    {isKeyboard ?
                        this.renderKeyboard() :
                        this.renderGamepad()}
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
