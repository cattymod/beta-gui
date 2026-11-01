import React from 'react';
import {isScratchDesktop} from '../../lib/isScratchDesktop';
import CloseButton from '../close-button/close-button.jsx';
import styles from './tw-news.css';

// Set to true by the CattyMod Mirror workflow before compiling.
const mirrored = false;

const LOCAL_STORAGE_KEY = 'cattymod:closedNews';

const NEWS_ITEMS = {
    beta: {
        id: 'cattymod-beta',
        body: (
            <>
                You are currently on CattyMod Beta.
            </>
        )
    },
    mirrored: {
        id: 'cattymod-mirrored',
        body: (
            <>
                This is a mirror of CattyMod. To get the latest changes, try going to{' '}
                <a href="https://cattymod.app/" target="_blank" rel="noopener noreferrer">
                    cattymod.app
                </a>.
            </>
        )
    }
};

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

        this.state = {
            closed: news ? getIsClosedInLocalStorage(news.id) : false
        };

        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        const news = getCurrentNews();

        if (!news) return;

        markAsClosedInLocalStorage(news.id);

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

        // The official studio must not display any banner.
        if (hostname === 'studio.cattymod.app') {
            return null;
        }

        // Show the mirror or beta banner when applicable.
        const news = getCurrentNews();

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

        // Other hosted pages are not official CattyMod pages.
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
}

export default TWNews;
