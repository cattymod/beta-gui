import React from 'react';
import PropTypes from 'prop-types';

import styles from './mobile-controls.css';

class MobileControls extends React.Component {
    constructor (props) {
        super(props);

        this.inputRef = React.createRef();

        this.handleKeyboardInput = this.handleKeyboardInput.bind(this);
        this.openKeyboard = this.openKeyboard.bind(this);
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

        if (!value) return;

        for (const character of value) {
            this.pressKey(character);
            this.releaseKey(character);
        }

        // Clear it so the user can immediately type another key.
        input.value = '';
    }

    openKeyboard () {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    }

    renderButton (label, key, sublabel) {
        return (
            <button
                className={styles.button}
                onPointerDown={event => {
                    event.preventDefault();
                    this.pressKey(key);
                }}
                onPointerUp={event => {
                    event.preventDefault();
                    this.releaseKey(key);
                }}
                onPointerCancel={() => this.releaseKey(key)}
                onPointerLeave={() => this.releaseKey(key)}
            >
                <span className={styles.label}>{label}</span>
                {sublabel ? (
                    <span className={styles.sublabel}>{sublabel}</span>
                ) : null}
            </button>
        );
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
