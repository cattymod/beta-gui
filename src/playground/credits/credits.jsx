import React from 'react';
import PropTypes from 'prop-types';
import render from '../app-target';
import styles from './credits.css';

import {APP_NAME} from '../../lib/brand';
import {applyGuiColors} from '../../lib/themes/guiHelpers';
import {detectTheme} from '../../lib/themes/themePersistance';
import UserData from './users';

/* eslint-disable react/jsx-no-literals */

applyGuiColors(detectTheme());
document.documentElement.lang = 'en';

const User = ({image, text, href}) => (
    <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={styles.user}
    >
        <img
            loading="lazy"
            className={styles.userImage}
            src={image}
            width="60"
            height="60"
        />
        <div className={styles.userInfo}>
            {text}
        </div>
    </a>
);
User.propTypes = {
    image: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    href: PropTypes.string
};

const UserList = ({users}) => (
    <div className={styles.users}>
        {users.map((data, index) => (
            <User
                key={index}
                {...data}
            />
        ))}
    </div>
);
UserList.propTypes = {
    users: PropTypes.arrayOf(PropTypes.object)
};

const Credits = () => (
    <main className={styles.main}>
        <header className={styles.headerContainer}>
            <h1 className={styles.headerText}>
                {APP_NAME} Credits
            </h1>
        </header>

        <section>
            <p>
                The {APP_NAME} project is made possible by the work of many volunteers.
            </p>
        </section>

        <section>
            <h2>Developers</h2>
            <UserList users={UserData.developers} />
        </section>

        {APP_NAME !== 'TurboWarp' && (
            // Be kind and considerate. Don't remove this :)
            <section>
                <h2>Forks, Code Usage and Assets</h2>
                <p>
                    {APP_NAME} is based on <a href="https://turbowarp.org/">TurboWarp</a> which is also the base of the Dango sprite.
                </p>
                <p>
                     Several icons are provided by <a href="https://lucide.dev/" target="_blank" rel="noreferrer">Lucide Icons</a>.
                </p>
                <p>
                    Scratch Paint is forked from <a href="https://warp.mistium.com/">MistWarp</a>.
                </p>
                <p>
                    The quote, Try it out icon, Happy face icon, Dango with blocks are from or based <a href="https://penguinmod.com/">PenguinMod</a>.
                </p>
                <p>
                    The Dango Artwork that have a server are based on <a href="https://snail-ide.js.org/" target="_blank" rel="noreferrer">Snail IDE</a>'s images.
                </p>
            </section>
        )}

        <section>
            <h2>Scratch</h2>
            <p>
                {APP_NAME} is based on the work of the <a href="https://scratch.mit.edu/credits">Scratch contributors</a> but is not endorsed by Scratch in any way.
            </p>
            <p>
                <a href="https://scratch.mit.edu/donate">
                    Donate to support Scratch.
                </a>
            </p>
        </section>

        <section>
            <h2>Contributors</h2>
            <UserList users={UserData.contributors} />
        </section>

        <section>
            <h2>Addons</h2>
            <UserList users={UserData.addonDevelopers} />
        </section>

        <section>
            <h2>Extension Gallery</h2>
            <UserList users={UserData.extensionDevelopers} />
        </section>

        <section>
            <h2>TurboWarp's Documentation</h2>
            <UserList users={UserData.docs} />
        </section>

        <section>
            <h2>Lovable</h2>
            <p>
                CattyMod's homepage was originally created using <a href="https://lovable.dev">Lovable</a> but is not endorsed by them in any way.
            </p>
        </section>
        
        <section>
            <h2>Testers</h2>
            <UserList users={UserData.testers} />
        </section>

        <section>
            <h2>Translators</h2>
            <p>
                More than 100 people have helped translate {APP_NAME} and its addons into many languages
                &mdash; far more than we could hope to list here.
            </p>
        </section>

        <section>
            <p>
                <i>
                    Individual contributors are listed in no particular order.
                    The order is randomized each visit.
                </i>
            </p>
        </section>
    </main>
);

render(<Credits />);
