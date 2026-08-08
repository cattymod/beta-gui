import React from 'react';
import {isScratchDesktop} from '../../lib/isScratchDesktop';
import CloseButton from '../close-button/close-button.jsx';
import styles from './tw-news.css';

const LOCAL_STORAGE_KEY = 'cattymod:closedNews';

const NEWS_ITEMS = {
    beta: {
        id: 'cattymod-beta',
        body: (
            <>
                You are on CattyMod Beta. Go to <a href="https://studio.cattymod.app">studio.cattymod.app</a> for the full release.
            </>
        )
    },
    release: {
        id: 'python-extension',
        body: (
            <>
                Introducing the new Python Extension for CattyMod! Check it out in the extension gallery.
            </>
        )
    }
};

const getCurrentNews = () => {
    if (window.location.hostname === 'beta.cattymod.app') {
        return NEWS_ITEMS.beta;
    }

    return NEWS_ITEMS.release;
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
        // ignore
    }
};

class TWNews extends React.Component {
    constructor(props) {
        super(props);

        const news = getCurrentNews();

        this.state = {
            closed: getIsClosedInLocalStorage(news.id)
        };

        this.handleClose = this.handleClose.bind(this);
    }

    handleClose() {
        const news = getCurrentNews();

        markAsClosedInLocalStorage(news.id);

        this.setState({
            closed: true
        }, () => {
            window.dispatchEvent(new Event('resize'));
        });
    }

    render() {
        if (this.state.closed || isScratchDesktop()) {
            return null;
        }

        const news = getCurrentNews();

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
}

export default TWNews;
