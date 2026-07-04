/* eslint-disable import/no-unresolved */
import overrideDefaultProject from '!arraybuffer-loader!./override-default-project.sb3';
/* eslint-enable import/no-unresolved */

const defaultProject = () => {
    // If your custom sb3 exists and is not empty, load it directly
    if (overrideDefaultProject && overrideDefaultProject.byteLength > 0) {
        return [{
            id: 0,
            assetType: 'Project',
            // Do not use 'JSON' here if it is a full .sb3 zip file, 
            // the vm loader will handle the binary array buffer automatically
            data: overrideDefaultProject
        }];
    }

    // Fallback empty project safety return if the file isn't found
    return [{
        id: 0,
        assetType: 'Project',
        dataFormat: 'JSON',
        data: JSON.stringify({targets: []})
    }];
};

export default defaultProject;
