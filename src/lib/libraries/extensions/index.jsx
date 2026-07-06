import React from 'react';
import {FormattedMessage} from 'react-intl';

import musicIconURL from './music/music.png';
import musicInsetIconURL from './music/music-small.svg';

import penIconURL from './pen/pen.png';
import penInsetIconURL from './pen/pen-small.svg';

import videoSensingIconURL from './videoSensing/video-sensing.png';
import videoSensingInsetIconURL from './videoSensing/video-sensing-small.svg';

import faceSensingIconURL from './faceSensing/face-sensing.svg';
import faceSensingInsetIconURL from './faceSensing/face-sensing-small.svg';

import text2speechIconURL from './text2speech/text2speech.png';
import text2speechInsetIconURL from './text2speech/text2speech-small.svg';

import translateIconURL from './translate/translate.png';
import translateInsetIconURL from './translate/translate-small.png';

import makeymakeyIconURL from './makeymakey/makeymakey.png';
import makeymakeyInsetIconURL from './makeymakey/makeymakey-small.svg';

import microbitIconURL from './microbit/microbit.png';
import microbitInsetIconURL from './microbit/microbit-small.svg';
import microbitConnectionIconURL from './microbit/microbit-illustration.svg';
import microbitConnectionSmallIconURL from './microbit/microbit-small.svg';

import ev3IconURL from './ev3/ev3.png';
import ev3InsetIconURL from './ev3/ev3-small.svg';
import ev3ConnectionIconURL from './ev3/ev3-hub-illustration.svg';
import ev3ConnectionSmallIconURL from './ev3/ev3-small.svg';

import wedo2IconURL from './wedo2/wedo.png';
import wedo2InsetIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionIconURL from './wedo2/wedo-illustration.svg';
import wedo2ConnectionSmallIconURL from './wedo2/wedo-small.svg';
import wedo2ConnectionTipIconURL from './wedo2/wedo-button-illustration.svg';

import boostIconURL from './boost/boost.png';
import boostInsetIconURL from './boost/boost-small.svg';
import boostConnectionIconURL from './boost/boost-illustration.svg';
import boostConnectionSmallIconURL from './boost/boost-small.svg';
import boostConnectionTipIconURL from './boost/boost-button-illustration.svg';

import gdxforIconURL from './gdxfor/gdxfor.png';
import gdxforInsetIconURL from './gdxfor/gdxfor-small.svg';
import gdxforConnectionIconURL from './gdxfor/gdxfor-illustration.svg';
import gdxforConnectionSmallIconURL from './gdxfor/gdxfor-small.svg';

import twIcon from './tw/tw.svg';
import customExtensionIcon from './custom/custom.svg';
import returnIcon from './custom/return.svg';
import galleryIcon from './gallery/gallery.svg';

import {APP_NAME} from '../../brand';

export default [
    {
        name: (
            <FormattedMessage
                defaultMessage="Music"
                id="gui.extension.music.name"
            />
        ),
        extensionId: 'music',
        iconURL: musicIconURL,
        insetIconURL: musicInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Play instruments and drums."
                id="gui.extension.music.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: (
            <FormattedMessage
                defaultMessage="Pen"
                id="gui.extension.pen.name"
            />
        ),
        extensionId: 'pen',
        iconURL: penIconURL,
        insetIconURL: penInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Draw with your sprites."
                id="gui.extension.pen.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: (
            <FormattedMessage
                defaultMessage="Video Sensing"
                id="gui.extension.videosensing.name"
            />
        ),
        extensionId: 'videoSensing',
        iconURL: videoSensingIconURL,
        insetIconURL: videoSensingInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Sense motion with the camera."
                id="gui.extension.videosensing.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: (
            <FormattedMessage
                defaultMessage="Face Sensing"
                id="tw.extension.faceSensing.name"
            />
        ),
        extensionId: 'faceSensing',
        extensionURL: 'https://extensions.turbowarp.org/lab/face-sensing.js',
        iconURL: faceSensingIconURL,
        insetIconURL: faceSensingInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Sense faces with the camera."
                id="tw.extension.faceSensing.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: (
            <FormattedMessage
                defaultMessage="Text to Speech"
                id="gui.extension.text2speech.name"
            />
        ),
        extensionId: 'text2speech',
        collaborator: 'Amazon Web Services',
        iconURL: text2speechIconURL,
        insetIconURL: text2speechInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Make your projects talk."
                id="gui.extension.text2speech.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: (
            <FormattedMessage
                defaultMessage="Translate"
                id="gui.extension.translate.name"
            />
        ),
        extensionId: 'translate',
        collaborator: 'Google',
        iconURL: translateIconURL,
        insetIconURL: translateInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Translate text into many languages."
                id="gui.extension.translate.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: 'Makey Makey',
        extensionId: 'makeymakey',
        iconURL: makeymakeyIconURL,
        insetIconURL: makeymakeyInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Make anything into a key."
                id="gui.extension.makeymakey.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: 'micro:bit',
        extensionId: 'microbit',
        iconURL: microbitIconURL,
        insetIconURL: microbitInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Connect your projects with the world."
                id="gui.extension.microbit.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: 'LEGO MINDSTORMS EV3',
        extensionId: 'ev3',
        iconURL: ev3IconURL,
        insetIconURL: ev3InsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Build interactive robots and more."
                id="gui.extension.ev3.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: 'LEGO BOOST',
        extensionId: 'boost',
        iconURL: boostIconURL,
        insetIconURL: boostInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Bring robotic creations to life."
                id="gui.extension.boost.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: 'LEGO Education WeDo 2.0',
        extensionId: 'wedo2',
        iconURL: wedo2IconURL,
        insetIconURL: wedo2InsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Build with motors and sensors."
                id="gui.extension.wedo2.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: 'Go Direct Force & Acceleration',
        extensionId: 'gdxfor',
        iconURL: gdxforIconURL,
        insetIconURL: gdxforInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Sense push, pull, motion, and spin."
                id="gui.extension.gdxfor.description"
            />
        ),
        tags: ['scratch'],
        featured: true
    },

    {
        name: (
            <FormattedMessage
                defaultMessage="Custom Reporters"
                id="tw.customReporters.name"
            />
        ),
        extensionId: 'procedures_enable_return',
        iconURL: returnIcon,
        description: (
            <FormattedMessage
                defaultMessage="Allow custom blocks to output values."
                id="tw.customReporters.description"
            />
        ),
        tags: ['tw'],
        featured: true
    },

    {
        name: (
            <FormattedMessage
                defaultMessage="{APP_NAME} Blocks"
                id="tw.twExtension.name"
                values={{APP_NAME}}
            />
        ),
        extensionId: 'tw',
        iconURL: twIcon,
        description: (
            <FormattedMessage
                defaultMessage="Weird new blocks."
                id="tw.twExtension.description"
            />
        ),
        tags: ['tw'],
        featured: true
    },

    {
        name: (
            <FormattedMessage
                defaultMessage="Custom Extension"
                id="tw.customExtension.name"
            />
        ),
        extensionId: 'custom_extension',
        iconURL: customExtensionIcon,
        description: (
            <FormattedMessage
                defaultMessage="Load custom extensions from URLs."
                id="tw.customExtension.description"
            />
        ),
        tags: ['tw'],
        featured: true
    },

    {
        name: (
            <FormattedMessage
                defaultMessage="Variables+"
                id="cattymod.extension.variablesPlus.name"
            />
        ),
        extensionId: 'cattyVariable',
        extensionURL: 'https://cattymod.app/assets/variables-plus.js',

        author: (
            <a
                href="https://scratch.mit.edu/users/Noahscratch493/"
                target="_blank"
                rel="noreferrer"
            >
                Noahscratch493
            </a>
        ),

        description: (
            <FormattedMessage
                defaultMessage="Create special variables anytime inside your code!"
                id="cattymod.extension.variablesPlus.description"
            />
        ),

        tags: ['tw'],
        featured: true
    }
];
