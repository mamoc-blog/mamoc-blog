import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.scss';
import utilStyles from '../../styles/utils.module.css';
import utilStyles2 from '../../styles/utils2.module.scss';
import Link from 'next/link';
import { SettingsProvider } from '../utils/Theme';
import {DarkModeToggle} from '../utils/DarkModeToggle';
import { useSettingsContext } from '../utils/Theme';

const name = '';
export const siteTitle = 'MAMOC';

export default function Layout({ children, home }) {
  const { darkTheme } = useSettingsContext();

  const mamocImgSrc = darkTheme
    ? "/images/mamoc-text-dark.png"
    : "/images/mamoc-text.png";
  
  return  (
    <SettingsProvider>
      <Head>
        <title>mamoc blog</title>
        {/* <link rel="shortcut icon" href="/images/favicon.ico" /> */}
        <link rel="apple-touch-icon" sizes="180x180" href="/images/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon-32x32.png"/>
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon-16x16.png"/>
      </Head>
        <header className={styles.header}>
          <>
            <div className={styles.layoutContainer}>
              <Link href='/'>
                <div className={styles.centeredComponents}>
                  <Image
                    key={mamocImgSrc} 
                    src={mamocImgSrc}
                    alt="mamoc"
                    width={200}
                    height={30}
                    />
                </div>
              </Link>
              <div>
                <DarkModeToggle/>
              </div>
            </div>
          </>
        </header>
      {home && 
      <section className={utilStyles2.imageSection}>
        <div className={utilStyles2.imageContainer}>

          {/* <iframe src="" width="1500" height="500"></iframe> */}
          <div  className={utilStyles2.iframeContainer}>
            <iframe src="https://ipfs.io/ipfs/QmZF6U1tExhq3peqaimnJ8zmQ4VCQ1a5hK1oSTW9HT7qVv/?fxhash=opMTaimRHSdr2t6MR5jfAs9fZ98Dbfw8FQKWshLcwKgNLuJ5yUz&fxiteration=172&fxminter=tz1fg4gu3agTw4BYwySKAq5cMYMnw6wfqrQx&fxparams=0c3fe333333333333340180000000000003fe199999999999a033fe00000000000003fc999999999999a3f9eb851eb851eb83fd0a3d70a3d70a43fb1eb851eb851ec"></iframe>
        </div>
        </div>

        
      </section>}
      <main >
        <div className={styles.container}>
          {children}
        </div>
      </main>
        {!home && (
          <div className={styles.backToHome}>
            <Link href="/">← Back to home</Link>
          </div>
        )}
        <div className={utilStyles2.spacer}></div>
        <div className={utilStyles2.spacer}></div>
        <div className={utilStyles2.spacer}></div>
        <div className={utilStyles2.imageContainer}>
        <Image
            priority
            src="/images/artwork4.svg"
            alt="placeholder"
            width={1500} // Adjust as needed
            height={500} // This sets the height of the image
            style={{ opacity: 0.3 }} 
          />
        </div>

    </SettingsProvider>
  );
}
