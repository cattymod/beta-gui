import projectData from './project-data';

/* eslint-disable import/no-unresolved */
import overrideDefaultProject from '!arraybuffer-loader!./override-default-project.sb3';
import backdrop from '!raw-loader!./cd21514d0531fdffb22204e0ec5ed84a.svg';
import costume1 from '!raw-loader!./dango.svg';
import costume2 from '!raw-loader!./build.svg';
import costume3 from '!raw-loader!./phone.svg';
import costume4 from '!raw-loader!./confused.svg';
/* eslint-enable import/no-unresolved */
import {TextEncoder} from '../tw-text-encoder';

const defaultProject = translator => {
    if (overrideDefaultProject.byteLength > 0) {
        return [{
            id: 0,
            assetType: 'Project',
            dataFormat: 'JSON',
            data: overrideDefaultProject
        }];
    }

    let _TextEncoder;
    if (typeof TextEncoder === 'undefined') {
        _TextEncoder = require('text-encoding').TextEncoder;
    } else {
        _TextEncoder = TextEncoder;
    }
    const encoder = new _TextEncoder();

    const projectJson = projectData(translator);
    return [{
        id: 0,
        assetType: 'Project',
        dataFormat: 'JSON',
        data: JSON.stringify(projectJson)
    }, {
        id: 'cd21514d0531fdffb22204e0ec5ed84a',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(backdrop)
    }, {
        id: '927d672925e7b99f7813735c484c6922',
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume1)
    }, {
        id: 'b3cd1258812e557b4b1a4390fb2031a5', // Placeholder ID for costume2
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume2)
    }, {
        id: 'c4de2369923f668c5c2b54a1fc3142b6', // Placeholder ID for costume3
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume3)
    }, {
        id: 'd5ef3470034a779d6d3c65b2fd4253c7', // Placeholder ID for costume4
        assetType: 'ImageVector',
        dataFormat: 'SVG',
        data: encoder.encode(costume4)
    }];
};

export default defaultProject;
