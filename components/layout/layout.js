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
  console.log(darkTheme);
  const mamocImgSrc = "/images/mamoc-text" + (darkTheme ? "-dark" : "") + ".png";

  return  (
    <SettingsProvider>
      <Head>
        <title>mamoc blog</title>
      </Head>
        <header className={styles.header}>
          <>
            <div className={styles.layoutContainer}>
<<<<<<< Updated upstream
              <div className={styles.centeredComponents}>
                <div className={styles.component}>
                  <Image
                    priority
                    src="/images/cam.png"
                    className={utilStyles.borderCircle}
                    height={75}
                    width={75}
                    alt={name}
                  />
                </div>
                <div className={styles.component}>
                  <Image
                    priority
                    src="/images/alex.png"
                    className={utilStyles.borderCircle}
                    height={75}
                    width={75}
                    alt={name}
                  />
                </div>
              </div>
              <div className={styles.before}>
              <h2>mamoc</h2>
              </div>
=======
              <Link href='/'>
                <div className={styles.centeredComponents}>
                  <Image
                    key={darkTheme ? 'dark' : 'light'} // Force re-render by changing ke
                    src={mamocImgSrc}
                    alt="mamoc"
                    width={200}
                    height={30}
                    />
                </div>
              </Link>
>>>>>>> Stashed changes
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
            src="/images/artwork3.svg"
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
