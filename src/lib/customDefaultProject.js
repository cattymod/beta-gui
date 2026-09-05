export const CUSTOM_DEFAULT_PROJECT_KEY =
    'cattymod:customDefaultProject';

const TRAMPOLINE_API =
    'https://trampoline.turbowarp.org/api/projects/';

const SCRATCH_PROJECTS_API =
    'https://projects.scratch.mit.edu/';

/*
 * Get the custom default project ID.
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
 * Remove the custom default project.
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
 * Get project metadata from TurboWarp Trampoline.
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
 * Download the SB3 project as an ArrayBuffer.
 *
 * This is equivalent to the result produced by:
 *
 *     FileReader.readAsArrayBuffer(file)
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

        return response.arrayBuffer();
    };

/*
 * Get the actual Scratch VM.
 *
 * CattyMod exposes the VM as window.vm.
 */
const getVM = () => {
    if (
        window.vm &&
        typeof window.vm.loadProject === 'function'
    ) {
        return window.vm;
    }

    return null;
};

/*
 * Wait for window.vm to exist.
 */
const waitForVM = () => {
    return new Promise((resolve, reject) => {
        const existingVM = getVM();

        if (existingVM) {
            resolve(existingVM);
            return;
        }

        let attempts = 0;

        const interval = setInterval(() => {
            const vm = getVM();

            if (vm) {
                clearInterval(interval);
                resolve(vm);
                return;
            }

            attempts++;

            /*
             * Stop waiting after 10 seconds so a broken
             * startup cannot leave an interval running forever.
             */
            if (attempts >= 100) {
                clearInterval(interval);
                reject(
                    new Error(
                        'Scratch VM was not available'
                    )
                );
            }
        }, 100);
    });
};

/*
 * Load the custom default project.
 *
 * This uses the exact same VM operation as your
 * working DevTools test:
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
         * Wait 300ms immediately before loading
         * the project into the Scratch VM.
         */
        await new Promise(resolve => {
            setTimeout(resolve, 300);
        });

        await vm.loadProject(projectData);

        console.log(
            `✅ Custom default project ${projectId} loaded`
        );

        return true;
    };

/*
 * Run when the New button is clicked.
 *
 * This contains the original initialization logic.
 */
export const onNewClick =
    async () => {
        const projectId =
            getCustomDefaultProject();

        /*
         * No custom project configured.
         *
         * Do absolutely nothing and allow the
         * normal CattyMod default project to load.
         */
        if (!projectId) {
            return false;
        }

        try {
            const vm =
                await waitForVM();

            return await loadCustomDefaultProject(
                vm
            );
        } catch (e) {
            console.error(
                '❌ Failed to load custom default project:',
                e
            );

            return false;
        }
    };

/*
 * Automatically load the custom default project.
 *
 * Do not automatically load it when a # is present
 * in the URL, since that indicates a project/editor
 * URL where the normal project should be preserved.
 */
export const initializeCustomDefaultProject =
    async () => {
        if (window.location.href.includes('#')) {
            return false;
        }

        return await onNewClick();
    };
