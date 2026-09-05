export const CUSTOM_DEFAULT_PROJECT_KEY =
    'cattymod:customDefaultProject';

const TRAMPOLINE_API =
    'https://trampoline.turbowarp.org/api/projects/';

const SCRATCH_PROJECTS_API =
    'https://projects.scratch.mit.edu/';

/*
 * Get the custom default project ID from localStorage.
 *
 * Example:
 *
 * cattymod:customDefaultProject = "404"
 *
 * Returns:
 *     "404"
 *
 * or:
 *     null
 *
 * when no valid project ID is configured.
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
        // Ignore localStorage errors.
        return null;
    }
};

/*
 * Set the custom default project ID.
 *
 * Example:
 *
 * setCustomDefaultProject('404');
 *
 * Pass null, undefined, or an empty string
 * to remove the setting.
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
 * Fetch project information from TurboWarp Trampoline.
 *
 * The response contains the project_token needed
 * to download the project from Scratch.
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
 * Get only the project token.
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
 *
 * Example:
 *
 * https://projects.scratch.mit.edu/404?token=...
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
 * Fetch the custom default Scratch project.
 *
 * Returns an ArrayBuffer suitable for
 * vm.loadProject().
 *
 * Returns null if no custom project is configured.
 */
export const fetchCustomDefaultProject =
    async () => {
        const projectId =
            getCustomDefaultProject();

        /*
         * No localStorage value.
         *
         * Do nothing so the normal built-in
         * default project can load normally.
         */
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

        return response.arrayBuffer();
    };

/*
 * Load the custom default project into a
 * Scratch VM.
 *
 * Returns:
 *
 *     true
 *         Custom project was loaded.
 *
 *     false
 *         No custom project is configured.
 */
export const loadCustomDefaultProject =
    async vm => {
        const projectId =
            getCustomDefaultProject();

        /*
         * No custom project configured.
         *
         * Do not touch the VM.
         */
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

        const arrayBuffer =
            await fetchCustomDefaultProject();

        if (!arrayBuffer) {
            return false;
        }

        await vm.loadProject(arrayBuffer);

        console.log(
            `✅ Custom default project ${projectId} loaded`
        );

        return true;
    };

/*
 * Automatically load the custom default project
 * if one is configured.
 *
 * If there is no localStorage value, nothing happens.
 */
export const initializeCustomDefaultProject =
    async vm => {
        const projectId =
            getCustomDefaultProject();

        /*
         * No custom project.
         *
         * Leave the normal built-in default project
         * completely alone.
         */
        if (!projectId) {
            return false;
        }

        try {
            return await loadCustomDefaultProject(vm);
        } catch (e) {
            /*
             * If the custom project cannot be fetched,
             * leave the normal project alone.
             */
            console.error(
                '❌ Failed to load custom default project:',
                e
            );

            return false;
        }
    };
