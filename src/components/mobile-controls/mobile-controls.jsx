import React from 'react';
import PropTypes from 'prop-types';

import styles from './mobile-controls.css';

class MobileControls extends React.Component {
    constructor (props) {
        super(props);

        this.inputRef = React.createRef();
        this.joystickRef = React.createRef();

        this.joystickActive = false;
        this.joystickDirection = null;

        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
        this.openKeyboard = this.openKeyboard.bind(this);

        this.handleJoystickDown = this.handleJoystickDown.bind(this);
        this.handleJoystickMove = this.handleJoystickMove.bind(this);
        this.handleJoystickUp = this.handleJoystickUp.bind(this);
    }

    componentWillUnmount () {
        this.releaseJoystickKey();
    }

    pressKey (key) {
        this.props.vm.postIOData('keyboard', {
            key,
            isDown: true
        });
    }

    releaseKey (key) {
        this.props.vm.postIOData('keyboard', {
            key,
            isDown: false
        });
    }

    handleKeyboardInput (event) {
        const input = event.target;
        const value = input.value;

        if (!value) {
            return;
        }

        for (const character of value) {
            this.pressKey(character);
            this.releaseKey(character);
        }

        input.value = '';
    }

    openKeyboard () {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    }

    renderButton (label, key, sublabel, extraClass = '') {
        return (
            <button
                className={`${styles.button} ${extraClass}`}
                onPointerDown={event => {
                    event.preventDefault();
                    event.currentTarget.setPointerCapture(event.pointerId);
                    event.currentTarget.classList.add(styles.pressed);
                    this.pressKey(key);
                }}
                onPointerUp={event => {
                    event.preventDefault();
                    event.currentTarget.classList.remove(styles.pressed);
                    this.releaseKey(key);
                }}
                onPointerCancel={event => {
                    event.currentTarget.classList.remove(styles.pressed);
                    this.releaseKey(key);
                }}
            >
                <span className={styles.label}>{label}</span>

                {sublabel ? (
                    <span className={styles.sublabel}>{sublabel}</span>
                ) : null}
            </button>
        );
    }

    getJoystickDirection (x, y) {
        const deadZone = 12;

        if (Math.sqrt((x * x) + (y * y)) < deadZone) {
            return null;
        }

        if (Math.abs(x) > Math.abs(y)) {
            return x > 0 ? 'right' : 'left';
        }

        return y > 0 ? 'down' : 'up';
    }

    getJoystickKey (direction) {
        switch (direction) {
        case 'up':
            return 'ArrowUp';
        case 'down':
            return 'ArrowDown';
        case 'left':
            return 'ArrowLeft';
        case 'right':
            return 'ArrowRight';
        default:
            return null;
        }
    }

    setJoystickDirection (direction) {
        if (direction === this.joystickDirection) {
            return;
        }

        this.releaseJoystickKey();

        if (direction) {
            const key = this.getJoystickKey(direction);

            if (key) {
                this.pressKey(key);
                this.joystickDirection = direction;
            }
        }
    }

    releaseJoystickKey () {
        if (!this.joystickDirection) {
            return;
        }

        const key = this.getJoystickKey(this.joystickDirection);

        if (key) {
            this.releaseKey(key);
        }

        this.joystickDirection = null;
    }

    moveJoystick (event) {
        if (!this.joystickActive || !this.joystickRef.current) {
            return;
        }

        const area = this.joystickRef.current;
        const rect = area.getBoundingClientRect();

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

        area.style.setProperty('--joystick-x', `${x}px`);
        area.style.setProperty('--joystick-y', `${y}px`);

        const direction = this.getJoystickDirection(x, y);

        this.setJoystickDirection(direction);
    }

    handleJoystickDown (event) {
        event.preventDefault();

        this.joystickActive = true;

        event.currentTarget.setPointerCapture(event.pointerId);

        this.moveJoystick(event);
    }

    handleJoystickMove (event) {
        event.preventDefault();

        this.moveJoystick(event);
    }

    handleJoystickUp (event) {
        event.preventDefault();

        this.joystickActive = false;

        if (this.joystickRef.current) {
            this.joystickRef.current.style.setProperty('--joystick-x', '0px');
            this.joystickRef.current.style.setProperty('--joystick-y', '0px');
        }

        this.releaseJoystickKey();

        try {
            event.currentTarget.releasePointerCapture(event.pointerId);
        } catch (e) {
            // Pointer capture may already have been released.
        }
    }

    render () {
        return (
            <div className={styles.controls}>
                <input
                    ref={this.inputRef}
                    className={styles.keyboardInput}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    onInput={this.handleKeyboardInput}
                    aria-label="Keyboard input"
                />

                <button
                    className={styles.keyboardButton}
                    onClick={this.openKeyboard}
                >
                    Use your Keyboard
                </button>

                <div className={styles.gameboyControls}>
                    <div className={styles.dpad}>
                        <div className={styles.dpadTop}>
                            {this.renderButton('↑', 'ArrowUp')}
                        </div>

                        <div className={styles.dpadMiddle}>
                            {this.renderButton('←', 'ArrowLeft')}

                            <div
                                ref={this.joystickRef}
                                className={styles.joystickArea}
                                onPointerDown={this.handleJoystickDown}
                                onPointerMove={this.handleJoystickMove}
                                onPointerUp={this.handleJoystickUp}
                                onPointerCancel={this.handleJoystickUp}
                            >
                                <div className={styles.joystick} />
                            </div>

                            {this.renderButton('→', 'ArrowRight')}
                        </div>

                        <div className={styles.dpadBottom}>
                            {this.renderButton('↓', 'ArrowDown')}
                        </div>
                    </div>

                    <div className={styles.abcd}>
                        {this.renderButton('A', ' ', 'Space')}
                        {this.renderButton('B', 'Enter', 'Enter')}
                        {this.renderButton('C', 'z', 'Z')}
                        {this.renderButton('D', 'x', 'X')}
                    </div>
                </div>
            </div>
        );
    }
}

MobileControls.propTypes = {
    vm: PropTypes.shape({
        postIOData: PropTypes.func.isRequired
    }).isRequired
};

export default MobileControls;
