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
          <Image
            priority
            src="/images/artwork4.svg"
            alt="placeholder"
            width={1500} // Adjust as needed
            height={500} // This sets the height of the image
          />
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
    </SettingsProvider>
  );
}
