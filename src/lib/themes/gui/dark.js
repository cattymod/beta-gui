const guiColors = {
    'color-scheme': 'dark',

    // Dark mode UI
    'ui-primary': '#111111',
    'ui-secondary': '#1e1e1e',
    'ui-tertiary': '#2e2e2e',

    'ui-modal-overlay': '#333333aa',
    'ui-modal-background': '#111111',
    'ui-modal-foreground': '#eeeeee',
    'ui-modal-header-background': '#333333',
    'ui-modal-header-foreground': '#ffffff',

    'ui-white': '#111111',
    'ui-black-transparent': '#ffffff26',

    'text-primary': '#eeeeee',

    /*
     * NAVBAR
     *
     * These intentionally use the LIGHT MODE colours.
     */
    'menu-bar-background': 'hsla(260, 60%, 60%, 1)', /* #855CD6 */
    'menu-bar-background-image': 'none',
    'menu-bar-foreground': '#ffffff',

    /*
     * Navbar colour palette
     * These are the same colours used by the light theme.
     */
    'menu-bar-primary': 'hsla(215, 100%, 65%, 1)', /* #4C97FF */
    'menu-bar-primary-dark': 'hsla(215, 60%, 50%, 1)', /* #3373CC */

    'menu-bar-purple': 'hsla(260, 60%, 60%, 1)', /* #855CD6 */
    'menu-bar-purple-dark': 'hsla(260, 42%, 51%, 1)', /* #714EB6 */
    'menu-bar-purple-transparent': 'hsla(260, 60%, 60%, 0.35)',
    'menu-bar-purple-light-transparent': 'hsla(260, 60%, 60%, 0.15)',

    'menu-bar-red': 'hsla(20, 100%, 55%, 1)', /* #FF661A */
    'menu-bar-red-dark': 'hsla(20, 100%, 45%, 1)', /* #E64D00 */

    'menu-bar-sound': 'hsla(300, 53%, 60%, 1)', /* #CF63CF */
    'menu-bar-sound-dark': 'hsla(300, 48%, 50%, 1)', /* #BD42BD */

    'menu-bar-control': 'hsla(38, 100%, 55%, 1)', /* #FFAB19 */

    'menu-bar-data': 'hsla(30, 100%, 55%, 1)', /* #FF8C1A */

    'menu-bar-pen': 'hsla(163, 85%, 40%, 1)', /* #0FBD8C */
    'menu-bar-pen-dark': 'hsla(163, 86%, 30%, 1)', /* #0B8E69 */

    'menu-bar-extensions': 'hsla(163, 85%, 40%, 1)', /* #0FBD8C */
    'menu-bar-extensions-dark': 'hsla(163, 85%, 30%, 1)', /* #0B8E69 */
    'menu-bar-extensions-transparent': 'hsla(163, 85%, 40%, 0.35)',

    /*
     * Navbar white/text colours
     */
    'menu-bar-white': '#ffffff',
    'menu-bar-white-dim': 'hsla(0, 100%, 100%, 0.75)',
    'menu-bar-white-transparent': 'hsla(0, 100%, 100%, 0.25)',
    'menu-bar-black-transparent': 'hsla(0, 0%, 0%, 0.15)',

    /*
     * Project title
     *
     * Light-mode values, even while the editor is dark.
     */
    'project-title-inactive': 'hsla(0, 100%, 100%, 0.25)',
    'project-title-hover': '#ffffff7f',

    /*
     * Feedback button
     *
     * Uses the same foreground colour as the light-mode navbar.
     */
    'feedback-button-foreground': '#ffffff',

    /*
     * Rest of the dark-mode editor
     */
    'assets-background': '#111111',

    'input-background': '#1e1e1e',

    'popover-background': '#1e1e1e',

    'shadow': 'hsla(0, 0%, 0%, 0.15)',

    'badge-background': '#16202c',
    'badge-border': '#203652',

    'fullscreen-background': '#111111',
    'fullscreen-accent': '#111111',

    'page-background': '#111111',
    'page-foreground': '#eeeeee',

    'link-color': '#44aaff',

    'filter-icon-black': 'invert(100%)',
    'filter-icon-gray': 'grayscale(100%) brightness(1.7)',
    'filter-icon-white': 'brightness(0) invert(100%)',

    'paint-ui-pane-border': 'var(--ui-black-transparent)',
    'paint-text-primary': 'var(--text-primary)',
    'paint-form-border': 'var(--ui-black-transparent)',
    'paint-looks-secondary': 'var(--menu-bar-purple)',
    'paint-looks-transparent': 'var(--menu-bar-purple-transparent)',
    'paint-input-background': 'var(--input-background)',
    'paint-popover-background': 'var(--popover-background)',
    'paint-filter-icon-gray': 'brightness(1.7)'
};

const blockColors = {
    insertionMarker: '#cccccc',

    workspace: '#1e1e1e',

    toolboxSelected: '#1e1e1e',

    toolboxText: '#cccccc',

    toolbox: '#111111',

    flyout: '#111111',

    scrollbar: '#666666',

    valueReportBackground: '#1e1e1e',
    valueReportBorder: '#333333',
    valueReportForeground: '#eeeeee',

    contextMenuBackground: '#111111',
    contextMenuBorder: '#ffffff26',
    contextMenuForeground: '#eeeeee',
    contextMenuActiveBackground: '#2e2e2e',
    contextMenuDisabledForeground: '#666666',

    flyoutLabelColor: '#cccccc',

    checkboxInactiveBackground: '#222222',
    checkboxInactiveBorder: '#c8c8c8',

    buttonBorder: '#c6c6c6',
    buttonActiveBackground: '#222222',
    buttonForeground: '#cccccc',

    zoomIconFilter: 'invert(100%)',

    gridColor: '#484848'
};

export {
    guiColors,
    blockColors
};
