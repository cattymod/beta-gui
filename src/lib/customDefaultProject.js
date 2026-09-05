export const CUSTOM_DEFAULT_PROJECT_KEY =
    'cattymod:customDefaultProject';

const TRAMPOLINE_API =
    'https://trampoline.turbowarp.org/api/projects/';

const SCRATCH_PROJECTS_API =
    'https://projects.scratch.mit.edu/';

/*
 * Get the custom default project ID from localStorage.
 */
export const getCustomDefaultProject = () => {
    try {
        const value =
            window.localStorage.getItem(
                CUSTOM_DEFAULT_PROJECT_KEY
            );

        if (!value) {
            return null;
        }

        const projectId = value.trim();

        if (!/^\d+$/.test(projectId)) {
            return null;
        }

        return projectId;
    } catch (e) {
        return null;
    }
};

/*
 * Set the custom default project ID.
 */
export const setCustomDefaultProject = projectId => {
    try {
        const value =
            String(projectId ?? '').trim();

        if (!value) {
            window.localStorage.removeItem(
                CUSTOM_DEFAULT_PROJECT_KEY
            );
            return;
        }

        if (!/^\d+$/.test(value)) {
            return;
        }

        window.localStorage.setItem(
            CUSTOM_DEFAULT_PROJECT_KEY,
            value
        );
    } catch (e) {
        // Ignore localStorage errors.
    }
};

/*
 * Remove the custom default project setting.
 */
export const clearCustomDefaultProject = () => {
    try {
        window.localStorage.removeItem(
            CUSTOM_DEFAULT_PROJECT_KEY
        );
    } catch (e) {
        // Ignore localStorage errors.
    }
};

/*
 * Fetch project metadata from TurboWarp Trampoline.
 */
export const getCustomDefaultProjectData =
    async projectId => {
        const id =
            String(projectId).trim();

        if (!/^\d+$/.test(id)) {
            throw new Error(
                `Invalid Scratch project ID: ${id}`
            );
        }

        const response = await fetch(
            `${TRAMPOLINE_API}${encodeURIComponent(id)}`
        );

        if (!response.ok) {
            throw new Error(
                `Failed to fetch project metadata: ${response.status}`
            );
        }

        const data =
            await response.json();

        if (
            !data ||
            typeof data.project_token !== 'string' ||
            !data.project_token
        ) {
            throw new Error(
                'Project metadata did not contain a project_token'
            );
        }

        return data;
    };

/*
 * Get the project token.
 */
export const getCustomDefaultProjectToken =
    async projectId => {
        const data =
            await getCustomDefaultProjectData(
                projectId
            );

        return data.project_token;
    };

/*
 * Build the Scratch project URL.
 */
export const getCustomDefaultProjectURL =
    async projectId => {
        const id =
            String(projectId).trim();

        const token =
            await getCustomDefaultProjectToken(
                id
            );

        return (
            `${SCRATCH_PROJECTS_API}` +
            `${encodeURIComponent(id)}` +
            `?token=${encodeURIComponent(token)}`
        );
    };

/*
 * Fetch the SB3 project.
 *
 * This is equivalent to the FileReader result
 * in your working console code:
 *
 *     reader.result
 *
 * except the data comes from Scratch instead
 * of a file selected by the user.
 */
export const fetchCustomDefaultProject =
    async () => {
        const projectId =
            getCustomDefaultProject();

        if (!projectId) {
            return null;
        }

        const projectURL =
            await getCustomDefaultProjectURL(
                projectId
            );

        const response =
            await fetch(projectURL);

        if (!response.ok) {
            throw new Error(
                `Failed to fetch Scratch project: ${response.status}`
            );
        }

        /*
         * This produces the same kind of data
         * that FileReader.readAsArrayBuffer()
         * gives your working code.
         */
        return response.arrayBuffer();
    };

/*
 * Load the project into the actual Scratch VM.
 *
 * This uses the exact same operation as:
 *
 *     vm.loadProject(reader.result)
 */
export const loadCustomDefaultProject =
    async vm => {
        const projectId =
            getCustomDefaultProject();

        if (!projectId) {
            return false;
        }

        if (
            !vm ||
            typeof vm.loadProject !== 'function'
        ) {
            throw new Error(
                'A valid Scratch VM is required'
            );
        }

        const projectData =
            await fetchCustomDefaultProject();

        if (!projectData) {
            return false;
        }

        /*
         * Equivalent to:
         *
         * vm.loadProject(reader.result)
         */
        await vm.loadProject(projectData);

        console.log(
            `✅ Custom default project ${projectId} loaded`
        );

        return true;
    };

/*
 * Initialize the custom default project.
 *
 * Pass the actual Scratch VM here.
 */
export const initializeCustomDefaultProject =
    async vm => {
        const projectId =
            getCustomDefaultProject();

        /*
         * No custom default project configured.
         *
         * Let CattyMod's normal default project
         * continue loading normally.
         */
        if (!projectId) {
            return false;
        }

        try {
            return await loadCustomDefaultProject(vm);
        } catch (e) {
            console.error(
                '❌ Failed to load custom default project:',
                e
            );

            return false;
        }
    };
