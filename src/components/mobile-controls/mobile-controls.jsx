import React from 'react';
import styles from './mobile-controls.css';

class MobileControls extends React.Component {
    constructor (props) {
        super(props);

        this.state = {
            controlMode: 'gamepad',
            keyboardLayout: 'abc',
            joystickDirections: [],
            joystickActive: false
        };

        this.joystickRef = React.createRef();
    }

    componentWillUnmount () {
        this.releaseAllKeys();
    }

    pressKey = key => {
        this.props.vm.postIOData('keyboard', {
            key,
            isDown: true
        });
    };

    releaseKey = key => {
        this.props.vm.postIOData('keyboard', {
            key,
            isDown: false
        });
    };

    tapKey = key => {
        this.pressKey(key);

        setTimeout(() => {
            this.releaseKey(key);
        }, 50);
    };

    releaseAllKeys = () => {
        const keys = [
            'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
            'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
            's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
            '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
            'space',
            'enter',
            'left',
            'up',
            'down',
            'right'
        ];

        keys.forEach(key => {
            this.releaseKey(key);
        });

        this.releaseJoystickKeys();
    };

    setControlMode = mode => {
        this.releaseAllKeys();

        this.setState({
            controlMode: mode,
            keyboardLayout: 'abc',
            joystickDirections: [],
            joystickActive: false
        });
    };

    toggleKeyboardLayout = () => {
        this.releaseAllKeys();

        this.setState(prevState => ({
            keyboardLayout:
                prevState.keyboardLayout === 'abc'
                    ? 'numbers'
                    : 'abc'
        }));
    };

    setJoystickDirections = directions => {
        const oldDirections =
            this.state.joystickDirections;

        oldDirections.forEach(direction => {
            if (!directions.includes(direction)) {
                this.releaseKey(direction);
            }
        });

        directions.forEach(direction => {
            if (!oldDirections.includes(direction)) {
                this.pressKey(direction);
            }
        });

        this.setState({
            joystickDirections: directions
        });
    };

    releaseJoystickKeys = () => {
        this.state.joystickDirections.forEach(direction => {
            this.releaseKey(direction);
        });

        this.setState({
            joystickDirections: []
        });
    };

    handleJoystickStart = event => {
        event.preventDefault();

        this.setState({
            joystickActive: true
        });

        this.updateJoystick(event);
    };

    handleJoystickMove = event => {
        if (!this.state.joystickActive) {
            return;
        }

        event.preventDefault();

        this.updateJoystick(event);
    };

    handleJoystickEnd = event => {
        event.preventDefault();

        this.setState({
            joystickActive: false
        });

        this.releaseJoystickKeys();
    };

    updateJoystick = event => {
        const joystick =
            this.joystickRef.current;

        if (!joystick) {
            return;
        }

        const rect =
            joystick.getBoundingClientRect();

        const centerX =
            rect.left + rect.width / 2;

        const centerY =
            rect.top + rect.height / 2;

        const x =
            event.clientX - centerX;

        const y =
            event.clientY - centerY;

        const distance =
            Math.sqrt(
                x * x +
                y * y
            );

        const deadZone = 12;
        const maxDistance = 27;

        if (distance < deadZone) {
            this.setJoystickDirections([]);
            return;
        }

        const angle =
            Math.atan2(y, x) *
            180 /
            Math.PI;

        let directions = [];

        if (
            angle >= -22.5 &&
            angle < 22.5
        ) {
            directions = ['right'];
        } else if (
            angle >= 22.5 &&
            angle < 67.5
        ) {
            directions = ['down', 'right'];
        } else if (
            angle >= 67.5 &&
            angle < 112.5
        ) {
            directions = ['down'];
        } else if (
            angle >= 112.5 &&
            angle < 157.5
        ) {
            directions = ['down', 'left'];
        } else if (
            angle >= 157.5 ||
            angle < -157.5
        ) {
            directions = ['left'];
        } else if (
            angle >= -157.5 &&
            angle < -112.5
        ) {
            directions = ['up', 'left'];
        } else if (
            angle >= -112.5 &&
            angle < -67.5
        ) {
            directions = ['up'];
        } else if (
            angle >= -67.5 &&
            angle < -22.5
        ) {
            directions = ['up', 'right'];
        }

        this.setJoystickDirections(
            directions
        );

        const knob =
            joystick.querySelector(
                `.${styles.joystickKnob}`
            );

        if (!knob) {
            return;
        }

        const knobX =
            distance === 0
                ? 0
                : (x / distance) *
                  Math.min(
                      distance,
                      maxDistance
                  );

        const knobY =
            distance === 0
                ? 0
                : (y / distance) *
                  Math.min(
                      distance,
                      maxDistance
                  );

        knob.style.transform =
            `translate(${knobX}px, ${knobY}px)`;
    };

    resetJoystickPosition = () => {
        const joystick =
            this.joystickRef.current;

        if (!joystick) {
            return;
        }

        const knob =
            joystick.querySelector(
                `.${styles.joystickKnob}`
            );

        if (knob) {
            knob.style.transform =
                'translate(0, 0)';
        }
    };

    handleJoystickEndAndReset = event => {
        this.handleJoystickEnd(event);
        this.resetJoystickPosition();
    };

    renderKeyboardButton = (
        key,
        label = key
    ) => (
        <button
            className={styles.keyboardKey}
            onPointerDown={event => {
                event.preventDefault();
                this.pressKey(key);
            }}
            onPointerUp={event => {
                event.preventDefault();
                this.releaseKey(key);
            }}
            onPointerCancel={event => {
                event.preventDefault();
                this.releaseKey(key);
            }}
            onPointerLeave={event => {
                if (
                    event.buttons === 1
                ) {
                    this.releaseKey(key);
                }
            }}
        >
            {label}
        </button>
    );

    renderNumberPad = () => {
        const rows = [
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
            ['0']
        ];

        return (
            <div className={styles.keyboardLayout}>
                {rows.map((row, rowIndex) => (
                    <div
                        className={styles.keyboardRow}
                        key={`number-row-${rowIndex}`}
                    >
                        {row.map(number =>
                            this.renderKeyboardButton(
                                number,
                                number
                            )
                        )}
                    </div>
                ))}

                <div className={styles.keyboardRow}>
                    <button
                        className={styles.keyboardKey}
                        onPointerDown={event => {
                            event.preventDefault();
                            this.pressKey('space');
                        }}
                        onPointerUp={event => {
                            event.preventDefault();
                            this.releaseKey('space');
                        }}
                        onPointerCancel={event => {
                            event.preventDefault();
                            this.releaseKey('space');
                        }}
                    >
                        Space
                    </button>

                    <button
                        className={styles.keyboardKey}
                        onPointerDown={event => {
                            event.preventDefault();
                            this.pressKey('enter');
                        }}
                        onPointerUp={event => {
                            event.preventDefault();
                            this.releaseKey('enter');
                        }}
                        onPointerCancel={event => {
                            event.preventDefault();
                            this.releaseKey('enter');
                        }}
                    >
                        Enter
                    </button>
                </div>

                {this.renderArrowKeys()}
            </div>
        );
    };

    renderArrowKeys = () => (
        <div className={styles.arrowKeys}>
            <div className={styles.arrowRow}>
                {this.renderKeyboardButton(
                    'up',
                    '↑'
                )}
            </div>

            <div className={styles.arrowRow}>
                {this.renderKeyboardButton(
                    'left',
                    '←'
                )}

                {this.renderKeyboardButton(
                    'down',
                    '↓'
                )}

                {this.renderKeyboardButton(
                    'right',
                    '→'
                )}
            </div>
        </div>
    );

    renderKeyboard = () => {
        const rows = [
            ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
            ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
            ['z', 'x', 'c', 'v', 'b', 'n', 'm']
        ];

        return (
            <div className={styles.keyboardLayout}>

                {rows.map((row, rowIndex) => (
                    <div
                        className={styles.keyboardRow}
                        key={`keyboard-row-${rowIndex}`}
                    >
                        {row.map(key =>
                            this.renderKeyboardButton(
                                key,
                                key.toUpperCase()
                            )
                        )}
                    </div>
                ))}

                <div className={styles.keyboardRow}>

                    <button
                        className={styles.keyboardKey}
                        onPointerDown={event => {
                            event.preventDefault();
                            this.pressKey('space');
                        }}
                        onPointerUp={event => {
                            event.preventDefault();
                            this.releaseKey('space');
                        }}
                        onPointerCancel={event => {
                            event.preventDefault();
                            this.releaseKey('space');
                        }}
                    >
                        Space
                    </button>

                    <button
                        className={styles.keyboardKey}
                        onPointerDown={event => {
                            event.preventDefault();
                            this.pressKey('enter');
                        }}
                        onPointerUp={event => {
                            event.preventDefault();
                            this.releaseKey('enter');
                        }}
                        onPointerCancel={event => {
                            event.preventDefault();
                            this.releaseKey('enter');
                        }}
                    >
                        Enter
                    </button>

                    <button
                        className={styles.keyboardKey}
                        onPointerDown={event => {
                            event.preventDefault();
                            this.toggleKeyboardLayout();
                        }}
                    >
                        123
                    </button>

                </div>

                {this.renderArrowKeys()}

            </div>
        );
    };

    renderKeyboardMode = () => (
        <div className={styles.keyboardContainer}>

            <div className={styles.keyboardTopRow}>

                <button
                    className={styles.keyboardLayoutButton}
                    onPointerDown={event => {
                        event.preventDefault();
                        this.toggleKeyboardLayout();
                    }}
                >
                    {this.state.keyboardLayout === 'abc'
                        ? '123'
                        : 'ABC'}
                </button>

            </div>

            {this.state.keyboardLayout === 'abc'
                ? this.renderKeyboard()
                : this.renderNumberPad()}

        </div>
    );

    renderGamepad = () => (
        <div className={styles.gamepad}>

            <div className={styles.dpad}>
                <button
                    className={`${styles.dpadButton} ${styles.dpadUp}`}
                    onPointerDown={() => this.pressKey('up')}
                    onPointerUp={() => this.releaseKey('up')}
                    onPointerCancel={() => this.releaseKey('up')}
                >
                    ↑
                </button>

                <button
                    className={`${styles.dpadButton} ${styles.dpadLeft}`}
                    onPointerDown={() => this.pressKey('left')}
                    onPointerUp={() => this.releaseKey('left')}
                    onPointerCancel={() => this.releaseKey('left')}
                >
                    ←
                </button>

                <button
                    className={`${styles.dpadButton} ${styles.dpadDown}`}
                    onPointerDown={() => this.pressKey('down')}
                    onPointerUp={() => this.releaseKey('down')}
                    onPointerCancel={() => this.releaseKey('down')}
                >
                    ↓
                </button>

                <button
                    className={`${styles.dpadButton} ${styles.dpadRight}`}
                    onPointerDown={() => this.pressKey('right')}
                    onPointerUp={() => this.releaseKey('right')}
                    onPointerCancel={() => this.releaseKey('right')}
                >
                    →
                </button>
            </div>

            <div
                ref={this.joystickRef}
                className={styles.joystick}
                onPointerDown={this.handleJoystickStart}
                onPointerMove={this.handleJoystickMove}
                onPointerUp={this.handleJoystickEndAndReset}
                onPointerCancel={this.handleJoystickEndAndReset}
                onPointerLeave={event => {
                    if (event.buttons === 1) {
                        this.handleJoystickEndAndReset(event);
                    }
                }}
            >
                <div
                    className={styles.joystickKnob}
                />
            </div>

            <div className={styles.actionButtons}>
                {['a', 'b', 'c', 'd'].map(key => (
                    <button
                        key={key}
                        className={
                            styles.actionButton
                        }
                        onPointerDown={event => {
                            event.preventDefault();
                            this.pressKey(key);
                        }}
                        onPointerUp={event => {
                            event.preventDefault();
                            this.releaseKey(key);
                        }}
                        onPointerCancel={event => {
                            event.preventDefault();
                            this.releaseKey(key);
                        }}
                    >
                        {key.toUpperCase()}
                    </button>
                ))}
            </div>

        </div>
    );

    render () {
        const {
            controlMode
        } = this.state;

        return (
            <div className={styles.mobileControls}>

                <button
                    className={styles.modeToggle}
                    onPointerDown={event => {
                        event.preventDefault();

                        this.setControlMode(
                            controlMode === 'gamepad'
                                ? 'keyboard'
                                : 'gamepad'
                        );
                    }}
                >
                    {controlMode === 'gamepad'
                        ? 'Use your Keyboard'
                        : 'Use Gamepad'}
                </button>

                {controlMode === 'gamepad'
                    ? this.renderGamepad()
                    : this.renderKeyboardMode()}

            </div>
        );
    }
}

export default MobileControls;
