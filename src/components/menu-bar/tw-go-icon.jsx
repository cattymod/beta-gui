import React from 'react';
import {FormattedMessage} from 'react-intl';

import {MenuItem, MenuSection} from '../menu/menu.jsx';

const GO_ICON_KEY = 'cattymod:goIcon';
const GO_ICON_PLAY = 'play';
const GO_ICON_GREEN_FLAG = 'greenflag';

const TWGoIconMenu = () => {
    const [goIcon, setGoIcon] = React.useState(() => {
        try {
            return localStorage.getItem(GO_ICON_KEY) || GO_ICON_PLAY;
        } catch (e) {
            return GO_ICON_PLAY;
        }
    });

    const onChangeGoIcon = mode => {
        setGoIcon(mode);

        try {
            localStorage.setItem(GO_ICON_KEY, mode);
        } catch (e) {
            // Ignore storage errors
        }

        // Let the existing Go Icon code know about the change.
        window.dispatchEvent(new CustomEvent('cattymod-go-icon-change', {
            detail: mode
        }));
    };

    return (
        <MenuSection>
            <MenuItem
                onClick={() => onChangeGoIcon(GO_ICON_PLAY)}
            >
                <FormattedMessage
                    defaultMessage="Play Button"
                    description="Go Icon option"
                    id="gui.goIcon.play"
                />
                {goIcon === GO_ICON_PLAY && ' ✓'}
            </MenuItem>

            <MenuItem
                onClick={() => onChangeGoIcon(GO_ICON_GREEN_FLAG)}
            >
                <FormattedMessage
                    defaultMessage="Green Flag"
                    description="Go Icon option"
                    id="gui.goIcon.greenFlag"
                />
                {goIcon === GO_ICON_GREEN_FLAG && ' ✓'}
            </MenuItem>
        </MenuSection>
    );
};

export default TWGoIconMenu;
