import React from 'react';
import {isScratchDesktop} from '../../lib/isScratchDesktop';
import {hasChromium157FilePickerBug} from '../../lib/tw-file-system-access';
import CloseButton from '../close-button/close-button.jsx';
import styles from './tw-news.css';

const LOCAL_STORAGE_KEY = 'tw:closedNews';
const NEWS_ID = 'chromium-file-pickers-2';

const newsAppliesToUser = () => hasChromium157FilePickerBug();

const FilePickerNewsBody = () => (
    <div className={styles.body}>
        <div>
            {/* eslint-disable-next-line max-len */}
            {'A bug in Chrome 157 and Edge 157 broke our open and save file dialogs.'}
        </div>
        <div>
            {/* eslint-disable-next-line max-len */}
            {'Until you update to 158 or newer, saving projects will always download a new copy of your project instead of overwriting the original file.'}
        </div>
    </div>
);

const getCurrentNews = () => {
    if (mirrored === true) {
        return NEWS_ITEMS.mirrored;
    }

    if (window.location.hostname === 'beta.cattymod.app') {
        return NEWS_ITEMS.beta;
    }

    return null;
};

const getIsClosedInLocalStorage = (newsId) => {
    try {
        return localStorage.getItem(LOCAL_STORAGE_KEY) === newsId;
    } catch (e) {
        return false;
    }
};

const markAsClosedInLocalStorage = (newsId) => {
    try {
        localStorage.setItem(LOCAL_STORAGE_KEY, newsId);
    } catch (e) {
        // Ignore storage errors.
    }
};

class TWNews extends React.Component {
    constructor(props) {
        super(props);

        const news = getCurrentNews();
        const filePickerNewsApplies = newsAppliesToUser();

        this.state = {
            closed: news
                ? getIsClosedInLocalStorage(news.id)
                : getIsClosedInLocalStorage('chromium-file-pickers'),
            filePickerNewsApplies
        };

        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        const news = getCurrentNews();
        const newsId = news ? news.id : 'chromium-file-pickers';

        markAsClosedInLocalStorage(newsId);

        this.setState({
            closed: true
        }, () => {
            window.dispatchEvent(new Event('resize'));
        });
    }

    render() {
        const {hostname, protocol} = window.location;

        // Never show banners in Scratch Desktop or local files.
        if (isScratchDesktop() || protocol === 'file:') {
            return null;
        }

        const news = getCurrentNews();

        // Show the mirror or beta banner when applicable.
        if (news) {
            if (this.state.closed) {
                return null;
            }

            return (
                <div className={styles.news}>
                    <CloseButton
                        className={styles.closeButton}
                        onClick={this.handleClose}
                    />

                    <div className={styles.body}>
                        {news.body}
                    </div>
                </div>
            );
        }

        // Show the Chromium file picker warning only to affected users.
        if (this.state.filePickerNewsApplies) {
            if (this.state.closed) {
                return null;
            }

            return (
                <div className={styles.news}>
                    <CloseButton
                        className={styles.closeButton}
                        onClick={this.handleClose}
                    />

                    <FilePickerNewsBody />
                </div>
            );
        }

        // Other hosted pages are not official CattyMod pages.
        if (hostname !== 'cattymod.app' &&
            hostname !== 'studio.cattymod.app') {
            return (
                <div className={styles.news}>
                    <div className={styles.body}>
                        This page is not officially by CattyMod.{' '}
                        <a href="https://cattymod.app/">
                            <strong>Go to cattymod.app</strong>
                        </a>
                        {' '}to get a private and powerful Scratch mod.
                    </div>
                </div>
            );
        }

        return null;
    }
}

export default TWNews;
