import React from 'react';
import PropTypes from 'prop-types';
import styles from './mobile-controls.css';

class MobileControls extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            keyboardValue: '',
            joystickDirection: null,
            joystickActive: false
        };

        this.keyboardInputRef = React.createRef();
        this.joystickAreaRef = React.createRef();
        this.joystickRef = React.createRef();
    }

    componentWillUnmount() {
        this.releaseJoystickKey();
    }

    pressKey = key => {
        const {vm} = this.props;

        if (!vm) return;

        vm.postIOData('keyboard', {
            key,
            isDown: true
        });
    };

    releaseKey = key => {
        const {vm} = this.props;

        if (!vm) return;

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

    handleKeyboardInput = event => {
        const value = event.target.value;

        if (!value) {
            return;
        }

        for (const character of value) {
            this.tapKey(character);
        }

        this.setState({
            keyboardValue: ''
        });
    };

    handleKeyboardChange = event => {
        this.setState({
            keyboardValue: event.target.value
        });
    };

    openKeyboard = () => {
        if (this.keyboardInputRef.current) {
            this.keyboardInputRef.current.focus();
        }
    };

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

    renderButton = (label, key, sublabel = null, extraClass = '') => (
        <button
            type="button"
            className={`${styles.button} ${extraClass}`}
            onPointerDown={event => this.handleButtonPointerDown(key, event)}
            onPointerUp={event => this.handleButtonPointerUp(key, event)}
            onPointerCancel={event => this.handleButtonPointerCancel(key, event)}
            onPointerLeave={event => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                    return;
                }

                event.currentTarget.classList.remove(styles.pressed);
                this.releaseKey(key);
            }}
        >
            <span className={styles.buttonLabel}>
                {label}
            </span>

            {sublabel ? (
                <span className={styles.buttonSubLabel}>
                    {sublabel}
                </span>
            ) : null}
        </button>
    );

    getJoystickDirection = (x, y) => {
        const deadZone = 12;

        if (Math.abs(x) < deadZone && Math.abs(y) < deadZone) {
            return null;
        }

        if (Math.abs(x) > Math.abs(y)) {
            return x > 0 ? 'right' : 'left';
        }

        return y > 0 ? 'down' : 'up';
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

    setJoystickDirection = direction => {
        const oldDirection = this.state.joystickDirection;

        if (oldDirection === direction) {
            return;
        }

        const oldKey = this.getJoystickKey(oldDirection);
        const newKey = this.getJoystickKey(direction);

        if (oldKey) {
            this.releaseKey(oldKey);
        }

        if (newKey) {
            this.pressKey(newKey);
        }

        this.setState({
            joystickDirection: direction
        });
    };

    releaseJoystickKey = () => {
        const {joystickDirection} = this.state;
        const key = this.getJoystickKey(joystickDirection);

        if (key) {
            this.releaseKey(key);
        }

        this.setState({
            joystickDirection: null
        });
    };

    moveJoystick = event => {
        if (!this.joystickAreaRef.current) {
            return;
        }

        const rect = this.joystickAreaRef.current.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

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

        this.setJoystickDirection(
            this.getJoystickDirection(x, y)
        );
    };

    handleJoystickPointerDown = event => {
        event.preventDefault();

        this.setState({
            joystickActive: true
        });

        event.currentTarget.setPointerCapture(event.pointerId);

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

        this.releaseJoystickKey();
    };

    render() {
        const {
            theme
        } = this.props;

        const isDark = theme && theme.gui === 'GUI_DARK';

        return (
            <div
                className={`${styles.mobileControls} ${
                    isDark ? styles.dark : styles.light
                }`}
            >
                <input
                    ref={this.keyboardInputRef}
                    className={styles.keyboardInput}
                    type="text"
                    value={this.state.keyboardValue}
                    onChange={this.handleKeyboardChange}
                    onInput={this.handleKeyboardInput}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    inputMode="text"
                    aria-label="Use your Keyboard"
                />

                <button
                    type="button"
                    className={styles.keyboardButton}
                    onClick={this.openKeyboard}
                >
                    Use your Keyboard
                </button>

                <div className={styles.controls}>
                    <div className={styles.dpad}>
                        <div className={styles.dpadTop}>
                            {this.renderButton(
                                '↑',
                                'ArrowUp',
                                null,
                                styles.arrowButton
                            )}
                        </div>

                        <div className={styles.dpadMiddle}>
                            {this.renderButton(
                                '←',
                                'ArrowLeft',
                                null,
                                styles.arrowButton
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
                                'ArrowRight',
                                null,
                                styles.arrowButton
                            )}
                        </div>

                        <div className={styles.dpadBottom}>
                            {this.renderButton(
                                '↓',
                                'ArrowDown',
                                null,
                                styles.arrowButton
                            )}
                        </div>
                    </div>

                    <div className={styles.actionButtons}>
                        {this.renderButton(
                            'A',
                            ' ',
                            'Space',
                            styles.actionButton
                        )}

                        {this.renderButton(
                            'B',
                            'Enter',
                            'Enter',
                            styles.actionButton
                        )}

                        {this.renderButton(
                            'C',
                            'z',
                            'Z',
                            styles.actionButton
                        )}

                        {this.renderButton(
                            'D',
                            'x',
                            'X',
                            styles.actionButton
                        )}
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

export default MobileControls;
