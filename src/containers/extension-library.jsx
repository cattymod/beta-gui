import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {defineMessages, injectIntl, intlShape} from 'react-intl';
import log from '../lib/log';

import extensionLibraryContent, {
    galleryError,
    galleryLoading,
    galleryMore
} from '../lib/libraries/extensions/index.jsx';
import extensionTags from '../lib/libraries/tw-extension-tags';

import LibraryComponent from '../components/library/library.jsx';
import extensionIcon from '../components/action-menu/icon--sprite.svg';

const messages = defineMessages({
    extensionTitle: {
        defaultMessage: 'Choose an Extension',
        description: 'Heading for the extension library',
        id: 'gui.extensionLibrary.chooseAnExtension'
    }
});

const TURBOWARP_INSET_ICON = 'https://cattymod.app/assets/turbowarp.svg';

const toLibraryItem = extension => {
    if (typeof extension === 'object') {
        return ({
            rawURL: extension.iconURL || extensionIcon,
            ...extension
        });
    }
    return extension;
};

const translateGalleryItem = (extension, locale) => ({
    ...extension,
    name: extension.nameTranslations[locale] || extension.name,
    description: extension.descriptionTranslations[locale] || extension.description
});

let cachedGallery = null;

const fetchLibrary = async () => {
    const res = await fetch(
        'https://extensions.turbowarp.org/generated-metadata/extensions-v0.json'
    );

    if (!res.ok) {
        throw new Error(`HTTP status ${res.status}`);
    }

    const data = await res.json();

    return data.extensions.map(extension => ({
        name: extension.name,
        nameTranslations: extension.nameTranslations || {},
        description: extension.description,
        descriptionTranslations: extension.descriptionTranslations || {},
        extensionId: extension.id,
        extensionURL: `https://extensions.turbowarp.org/${extension.slug}.js`,

        iconURL: `https://extensions.turbowarp.org/${
            extension.image || 'images/unknown.svg'
        }`,

        tags: ['tw'],

        insetIconURL: TURBOWARP_INSET_ICON,

        credits: [
            ...(extension.original || []),
            ...(extension.by || [])
        ].map(credit => {
            if (credit.link) {
                return (
                    <a
                        href={credit.link}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        {credit.name}
                    </a>
                );
            }

            return credit.name;
        }),

        docsURI: extension.docs
            ? `https://extensions.turbowarp.org/${extension.slug}`
            : null,

        samples: extension.samples
            ? extension.samples.map(sample => ({
                href: `${
                    process.env.ROOT
                }editor?project_url=https://extensions.turbowarp.org/samples/${encodeURIComponent(
                    sample
                )}.sb3`,
                text: sample
            }))
            : null,

        incompatibleWithScratch: !extension.scratchCompatible,
        featured: true
    }));
};

class ExtensionLibrary extends React.PureComponent {
    constructor (props) {
        super(props);

        bindAll(this, [
            'handleItemSelect',
            'handleInstallToggle'
        ]);

        this.state = {
            gallery: cachedGallery,
            galleryError: null,
            galleryTimedOut: false,
            installedExtensions: new Set()
        };
    }

    componentDidMount () {
        if (!this.state.gallery) {
            const timeout = setTimeout(() => {
                this.setState({
                    galleryTimedOut: true
                });
            }, 750);

            fetchLibrary()
                .then(gallery => {
                    cachedGallery = gallery;

                    this.setState({
                        gallery
                    }, () => {
                        this._updateInstalledSet();
                    });

                    clearTimeout(timeout);
                })
                .catch(error => {
                    log.error(error);

                    this.setState({
                        galleryError: error
                    });

                    clearTimeout(timeout);
                });
        } else {
            this._updateInstalledSet();
        }
    }

    _updateInstalledSet () {
        try {
            const installed = new Set();
            extensionLibraryContent.forEach(i => {
                if (i && i.extensionId) {
                    if (this.props.vm && this.props.vm.extensionManager && this.props.vm.extensionManager.isExtensionLoaded(i.extensionId)) {
                        installed.add(i.extensionId);
                    }
                }
            });
            if (this.state.gallery) {
                this.state.gallery.forEach(i => {
                    if (i && i.extensionId) {
                        if (this.props.vm && this.props.vm.extensionManager && this.props.vm.extensionManager.isExtensionLoaded(i.extensionId)) {
                            installed.add(i.extensionId);
                        }
                    }
                });
            }
            this.setState({installedExtensions: installed});
        } catch (e) {
            log.warn('Failed to compute installed extensions', e);
        }
    }

    handleItemSelect (item) {
        if (item.href) {
            return;
        }

        const extensionId = item.extensionId;

        if (extensionId === 'custom_extension') {
            this.props.onOpenCustomExtensionModal();
            return;
        }

        if (extensionId === 'procedures_enable_return') {
            this.props.onEnableProcedureReturns();
            this.props.onCategorySelected('myBlocks');
            return;
        }

        // Keep clicking the item area from auto-installing; users should use the
        // Install/Uninstall button. Preserve category selection for already-loaded extensions.
        if (extensionId && this.props.vm && this.props.vm.extensionManager && this.props.vm.extensionManager.isExtensionLoaded(extensionId)) {
            this.props.onCategorySelected(extensionId);
        }
    }

    handleInstallToggle (item) {
        if (!item || !item.extensionId) return;
        const extensionId = item.extensionId;
        const url = item.extensionURL ? item.extensionURL : extensionId;

        const manager = this.props.vm && this.props.vm.extensionManager;
        if (!manager) return;

        if (manager.isExtensionLoaded(extensionId)) {
            manager.removeExtension(extensionId)
                .then(() => {
                    this.setState(old => {
                        const s = new Set(old.installedExtensions);
                        s.delete(extensionId);
                        return {installedExtensions: s};
                    });
                })
                .catch(err => {
                    log.error(err);
                    // eslint-disable-next-line no-alert
                    alert(err);
                });
        } else {
            manager.loadExtensionURL(url)
                .then(() => {
                    this.setState(old => {
                        const s = new Set(old.installedExtensions);
                        s.add(extensionId);
                        return {installedExtensions: s};
                    });
                })
                .catch(err => {
                    log.error(err);
                    // eslint-disable-next-line no-alert
                    alert(err);
                });
        }
    }

    render () {
        let library = null;

        if (
            this.state.gallery ||
            this.state.galleryError ||
            this.state.galleryTimedOut
        ) {
            library = extensionLibraryContent.map(toLibraryItem);

            library.push('---');

            if (this.state.gallery) {
                library.push(toLibraryItem(galleryMore));

                const locale = this.props.intl.locale;

                library.push(
                    ...this.state.gallery
                        .filter(i => i.extensionId !== 'faceSensing')
                        .map(i => translateGalleryItem(i, locale))
                        .map(toLibraryItem)
                );
            } else if (this.state.galleryError) {
                library.push(toLibraryItem(galleryError));
            } else {
                library.push(toLibraryItem(galleryLoading));
            }
        }

        return (
            <LibraryComponent
                data={library}
                filterable
                persistableKey="extensionId"
                id="extensionLibrary"
                tags={extensionTags}
                title={this.props.intl.formatMessage(messages.extensionTitle)}
                visible={this.props.visible}
                onItemSelected={this.handleItemSelect}
                onItemInstall={this.handleInstallToggle}
                installedExtensions={this.state.installedExtensions}
                onRequestClose={this.props.onRequestClose}
            />
        );
    }
}

ExtensionLibrary.propTypes = {
    intl: intlShape.isRequired,
    onCategorySelected: PropTypes.func,
    onEnableProcedureReturns: PropTypes.func,
    onOpenCustomExtensionModal: PropTypes.func,
    onRequestClose: PropTypes.func,
    visible: PropTypes.bool,
    vm: PropTypes.instanceOf(VM).isRequired // eslint-disable-line react/no-unused-prop-types
};

export default injectIntl(ExtensionLibrary);
