
import defaultsDeep from 'lodash.defaultsdeep';

import * as accentAce from './accent/ace';
import * as accentAurora from './accent/aurora';
import * as accentBi from './accent/bi';
import * as accentBlue from './accent/blue';
import * as accentCherry from './accent/cherry';
import * as accentCoral from './accent/coral';
import * as accentCosmic from './accent/cosmic';
import * as accentFire from './accent/fire';
import * as accentForest from './accent/forest';
import * as accentGay from './accent/gay';
import * as accentGreen from './accent/green';
import * as accentHoney from './accent/honey';
import * as accentLavender from './accent/lavender';
import * as accentLesbian from './accent/lesbian';
import * as accentMatrix from './accent/matrix';
import * as accentMint from './accent/mint';
import * as accentNebula from './accent/nebula';
import * as accentNonbinary from './accent/nonbinary';
import * as accentOcean from './accent/ocean';
import * as accentOrange from './accent/orange';
import * as accentPan from './accent/pan';
import * as accentPink from './accent/pink';
import * as accentPurple from './accent/purple';
import * as accentRainbow from './accent/rainbow';
import * as accentRed from './accent/red';
import * as accentMetal from './accent/rotur';
import * as accentSky from './accent/sky';
import * as accentSunset from './accent/sunset';
import * as accentTrans from './accent/trans';
import * as accentVaporwave from './accent/vaporwave';
import * as accentYellow from './accent/yellow';

import * as guiLight from './gui/light';
import * as guiDark from './gui/dark';
import * as guiMidnight from './gui/midnight';

import * as blocksThree from './blocks/three';
import * as blocksHighContrast from './blocks/high-contrast';
import * as blocksDark from './blocks/dark';

// Accent keys
const ACCENT_ACE = 'ace';
const ACCENT_AURORA = 'aurora';
const ACCENT_BI = 'bi';
const ACCENT_BLUE = 'blue';
const ACCENT_CHERRY = 'cherry';
const ACCENT_CORAL = 'coral';
const ACCENT_COSMIC = 'cosmic';
const ACCENT_FIRE = 'fire';
const ACCENT_FOREST = 'forest';
const ACCENT_GAY = 'gay';
const ACCENT_GREEN = 'green';
const ACCENT_HONEY = 'honey';
const ACCENT_LAVENDER = 'lavender';
const ACCENT_LESBIAN = 'lesbian';
const ACCENT_MATRIX = 'matrix';
const ACCENT_MINT = 'mint';
const ACCENT_NEBULA = 'nebula';
const ACCENT_NONBINARY = 'nonbinary';
const ACCENT_OCEAN = 'ocean';
const ACCENT_ORANGE = 'orange';
const ACCENT_PAN = 'pan';
const ACCENT_PINK = 'pink';
const ACCENT_PURPLE = 'purple';
const ACCENT_RAINBOW = 'rainbow';
const ACCENT_RED = 'red';
const ACCENT_METAL = 'rotur';
const ACCENT_SKY = 'sky';
const ACCENT_SUNSET = 'sunset';
const ACCENT_TRANS = 'trans';
const ACCENT_VAPORWAVE = 'vaporwave';
const ACCENT_YELLOW = 'yellow';

const ACCENT_MAP = {
    [ACCENT_ACE]: accentAce,
    [ACCENT_AURORA]: accentAurora,
    [ACCENT_BI]: accentBi,
    [ACCENT_BLUE]: accentBlue,
    [ACCENT_CHERRY]: accentCherry,
    [ACCENT_CORAL]: accentCoral,
    [ACCENT_COSMIC]: accentCosmic,
    [ACCENT_FIRE]: accentFire,
    [ACCENT_FOREST]: accentForest,
    [ACCENT_GAY]: accentGay,
    [ACCENT_GREEN]: accentGreen,
    [ACCENT_HONEY]: accentHoney,
    [ACCENT_LAVENDER]: accentLavender,
    [ACCENT_LESBIAN]: accentLesbian,
    [ACCENT_MATRIX]: accentMatrix,
    [ACCENT_MINT]: accentMint,
    [ACCENT_NEBULA]: accentNebula,
    [ACCENT_NONBINARY]: accentNonbinary,
    [ACCENT_OCEAN]: accentOcean,
    [ACCENT_ORANGE]: accentOrange,
    [ACCENT_PAN]: accentPan,
    [ACCENT_PINK]: accentPink,
    [ACCENT_PURPLE]: accentPurple,
    [ACCENT_RAINBOW]: accentRainbow,
    [ACCENT_RED]: accentRed,
    [ACCENT_METAL]: accentMetal,
    [ACCENT_SKY]: accentSky,
    [ACCENT_SUNSET]: accentSunset,
    [ACCENT_TRANS]: accentTrans,
    [ACCENT_VAPORWAVE]: accentVaporwave,
    [ACCENT_YELLOW]: accentYellow
};

const ACCENT_DEFAULT = ACCENT_BLUE;

// GUI modes
const GUI_LIGHT = 'light';
const GUI_DARK = 'dark';
const GUI_MIDNIGHT = 'midnight';

const GUI_MAP = {
    [GUI_LIGHT]: guiLight,
    [GUI_DARK]: guiDark,
    [GUI_MIDNIGHT]: guiMidnight
};

const GUI_DEFAULT = GUI_LIGHT;

// Block modes
const BLOCKS_THREE = 'three';
const BLOCKS_DARK = 'dark';
const BLOCKS_HIGH_CONTRAST = 'high-contrast';
const BLOCKS_CUSTOM = 'custom';

const BLOCKS_DEFAULT = BLOCKS_THREE;

const defaultBlockColors = blocksThree.blockColors;

const BLOCKS_MAP = {
    [BLOCKS_THREE]: {
        blocksMediaFolder: 'blocks-media/default',
        colors: blocksThree.blockColors,
        extensions: blocksThree.extensions,
        customExtensionColors: {},
        useForStage: true
    },
    [BLOCKS_HIGH_CONTRAST]: {
        blocksMediaFolder: 'blocks-media/high-contrast',
        colors: defaultsDeep(
            {},
            blocksHighContrast.blockColors,
            defaultBlockColors
        ),
        extensions: blocksHighContrast.extensions,
        customExtensionColors: blocksHighContrast.customExtensionColors,
        useForStage: true
    },
    [BLOCKS_DARK]: {
        blocksMediaFolder: 'blocks-media/default',
        colors: defaultsDeep(
            {},
            blocksDark.blockColors,
            defaultBlockColors
        ),
        extensions: blocksDark.extensions,
        customExtensionColors: blocksDark.customExtensionColors,
        useForStage: false
    },
    [BLOCKS_CUSTOM]: {
        // To be filled by editor-theme3 addon
        blocksMediaFolder: 'blocks-media/default',
        colors: blocksThree.blockColors,
        extensions: {},
        customExtensionColors: {},
        useForStage: false
    }
};

let themeObjectsCreated = 0;

class Theme {
    constructor (accent, gui, blocks) {
        this.id = ++themeObjectsCreated;

        this.accent = Object.prototype.hasOwnProperty.call(ACCENT_MAP, accent)
            ? accent
            : ACCENT_DEFAULT;

        this.gui = Object.prototype.hasOwnProperty.call(GUI_MAP, gui)
            ? gui
            : GUI_DEFAULT;

        this.blocks = Object.prototype.hasOwnProperty.call(BLOCKS_MAP, blocks)
            ? blocks
            : BLOCKS_DEFAULT;
    }

    static light = new Theme(
        ACCENT_DEFAULT,
        GUI_LIGHT,
        BLOCKS_DEFAULT
    );

    static dark = new Theme(
        ACCENT_DEFAULT,
        GUI_DARK,
        BLOCKS_DEFAULT
    );

    static midnight = new Theme(
        ACCENT_DEFAULT,
        GUI_MIDNIGHT,
        BLOCKS_DEFAULT
    );

    static highContrast = new Theme(
        ACCENT_DEFAULT,
        GUI_DEFAULT,
        BLOCKS_HIGH_CONTRAST
    );

    set (what, to) {
        if (what === 'accent') {
            return new Theme(to, this.gui, this.blocks);
        } else if (what === 'gui') {
            return new Theme(this.accent, to, this.blocks);
        } else if (what === 'blocks') {
            return new Theme(this.accent, this.gui, to);
        }

        throw new Error(`Unknown theme property: ${what}`);
    }

    getBlocksMediaFolder () {
        return BLOCKS_MAP[this.blocks].blocksMediaFolder;
    }

    getGuiColors () {
        return defaultsDeep(
            {},
            ACCENT_MAP[this.accent].guiColors,
            GUI_MAP[this.gui].guiColors,
            guiLight.guiColors
        );
    }

    getBlockColors () {
        return defaultsDeep(
            {},
            ACCENT_MAP[this.accent].blockColors,
            GUI_MAP[this.gui].blockColors,
            BLOCKS_MAP[this.blocks].colors
        );
    }

    getExtensions () {
        return BLOCKS_MAP[this.blocks].extensions;
    }

    isDark () {
        return this.getGuiColors()['color-scheme'] === 'dark';
    }

    getStageBlockColors () {
        if (BLOCKS_MAP[this.blocks].useForStage) {
            return this.getBlockColors();
        }

        return Theme.light.getBlockColors();
    }

    getCustomExtensionColors () {
        return BLOCKS_MAP[this.blocks].customExtensionColors;
    }
}

export {
    Theme,
    defaultBlockColors,

    ACCENT_ACE,
    ACCENT_AURORA,
    ACCENT_BI,
    ACCENT_BLUE,
    ACCENT_CHERRY,
    ACCENT_CORAL,
    ACCENT_COSMIC,
    ACCENT_FIRE,
    ACCENT_FOREST,
    ACCENT_GAY,
    ACCENT_GREEN,
    ACCENT_HONEY,
    ACCENT_LAVENDER,
    ACCENT_LESBIAN,
    ACCENT_MATRIX,
    ACCENT_MINT,
    ACCENT_NEBULA,
    ACCENT_NONBINARY,
    ACCENT_OCEAN,
    ACCENT_ORANGE,
    ACCENT_PAN,
    ACCENT_PINK,
    ACCENT_PURPLE,
    ACCENT_RAINBOW,
    ACCENT_RED,
    ACCENT_METAL,
    ACCENT_SKY,
    ACCENT_SUNSET,
    ACCENT_TRANS,
    ACCENT_VAPORWAVE,
    ACCENT_YELLOW,

    ACCENT_MAP,

    GUI_LIGHT,
    GUI_DARK,
    GUI_MIDNIGHT,
    GUI_MAP,

    BLOCKS_THREE,
    BLOCKS_DARK,
    BLOCKS_HIGH_CONTRAST,
    BLOCKS_CUSTOM,
    BLOCKS_MAP
};
