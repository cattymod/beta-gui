import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';

import {MenuItem, Submenu} from '../menu/menu.jsx';

import {
    GO_ICON_PLAY,
    GO_ICON_GREEN_FLAG,
    GO_ICON_BLUE_FLAG,
    GO_ICON_PURPLE_FLAG,
    getGoIcon,
    getGoIconImage,
    setGoIcon,
    applyGoIcon
} from '../../lib/go-icon';

import styles from './settings-menu.css';

import check from './check.svg';
import dropdownCaret from './dropdown-caret.svg';

const isFileProtocol = () =>
    typeof window !== 'undefined' &&
    window.location.protocol === 'file:';

const GoIconPreview = props => (
    <img
        src={props.icon}
        draggable={false}
        width={20}
        height={20}
        alt=""
        style={{
            width: 20,
            height: 20,
            objectFit: 'contain',
            background: 'transparent',
            borderRadius: 0,
            filter: 'brightness(0) invert(1)'
        }}
    />
);

GoIconPreview.propTypes = {
    icon: PropTypes.string
};

const GoIconMenuItem = ({
    icon,
    isSelected,
    label,
    onClick
}) => (
    <MenuItem onClick={onClick}>
        <div className={styles.option}>
            <img
                className={classNames(styles.check, {
                    [styles.selected]: isSelected
                })}
                width={15}
                height={12}
                src={check}
                draggable={false}
                alt=""
            />

            <GoIconPreview icon={icon} />

            <span>{label}</span>
        </div>
    </MenuItem>
);

GoIconMenuItem.propTypes = {
    icon: PropTypes.string,
    isSelected: PropTypes.bool,
    label: PropTypes.string,
    onClick: PropTypes.func
};

const TWGoIcon = ({
    isOpen,
    isRtl,
    onRequestClose,
    onCloseOtherMenus
}) => {
    const [goIcon, setGoIconState] = useState(() =>
        isFileProtocol() ? GO_ICON_PLAY : getGoIcon()
    );

    const [goIconMenuOpen, setGoIconMenuOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setGoIconMenuOpen(false);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isFileProtocol()) {
            setGoIconMenuOpen(false);
            return undefined;
        }

        applyGoIcon(goIcon);

        return undefined;
    }, [goIcon]);

    function onChangeGoIcon(mode) {
        if (isFileProtocol()) {
            return;
        }

        if (
            mode !== GO_ICON_PLAY &&
            mode !== GO_ICON_GREEN_FLAG &&
            mode !== GO_ICON_BLUE_FLAG &&
            mode !== GO_ICON_PURPLE_FLAG
        ) {
            return;
        }

        setGoIcon(mode);
        setGoIconState(mode);
        applyGoIcon(mode);

        setGoIconMenuOpen(false);
        onRequestClose();
    }

    function onOpenGoIconMenu() {
        if (isFileProtocol()) {
            return;
        }

        onCloseOtherMenus();

        setGoIconMenuOpen(true);
    }

    if (isFileProtocol()) {
        return null;
    }

    return (
        <MenuItem expanded={goIconMenuOpen}>
            <div
                className={styles.option}
                onClick={onOpenGoIconMenu}
            >
                <GoIconPreview
                    icon={getGoIconImage(goIcon)}
                />

                <span className={styles.submenuLabel}>
                    Go Icon
                </span>

                <img
                    className={styles.expandCaret}
                    src={dropdownCaret}
                    draggable={false}
                    alt=""
                />
            </div>

            <Submenu place={isRtl ? 'left' : 'right'}>
                <GoIconMenuItem
                    icon={getGoIconImage(GO_ICON_PLAY)}
                    label="Play Button (default)"
                    isSelected={goIcon === GO_ICON_PLAY}
                    onClick={() => onChangeGoIcon(GO_ICON_PLAY)}
                />

                <GoIconMenuItem
                    icon={getGoIconImage(GO_ICON_GREEN_FLAG)}
                    label="Green Flag"
                    isSelected={goIcon === GO_ICON_GREEN_FLAG}
                    onClick={() => onChangeGoIcon(GO_ICON_GREEN_FLAG)}
                />

                <GoIconMenuItem
                    icon={getGoIconImage(GO_ICON_BLUE_FLAG)}
                    label="Blue Flag"
                    isSelected={goIcon === GO_ICON_BLUE_FLAG}
                    onClick={() => onChangeGoIcon(GO_ICON_BLUE_FLAG)}
                />

                <GoIconMenuItem
                    icon={getGoIconImage(GO_ICON_PURPLE_FLAG)}
                    label="Purple Flag"
                    isSelected={goIcon === GO_ICON_PURPLE_FLAG}
                    onClick={() => onChangeGoIcon(GO_ICON_PURPLE_FLAG)}
                />
            </Submenu>
        </MenuItem>
    );
};

TWGoIcon.propTypes = {
    isOpen: PropTypes.bool,
    isRtl: PropTypes.bool,
    onRequestClose: PropTypes.func,
    onCloseOtherMenus: PropTypes.func
};

export default TWGoIcon;
