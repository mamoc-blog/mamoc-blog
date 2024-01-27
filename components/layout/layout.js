import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.scss';
import utilStyles from '../../styles/utils.module.css';
import utilStyles2 from '../../styles/utils2.module.scss';
import Link from 'next/link';
import { SettingsProvider } from '../Theme';
import {DarkModeToggle} from '../DarkModeToggle';

const name = '';
export const siteTitle = 'mamoc-blog';

export default function Layout({ children, home }) {
  return  (
    <SettingsProvider>
      <Head>
        <title>mamoc blog</title>
      </Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <>
            <div className={styles.layoutContainer}>
              <div className={styles.centeredComponents}>
                <div className={styles.component}>
                  
                </div>
                <div className={styles.component}>
                 
                </div>
              </div>
              <div className={styles.title}>
                <h1>mamoc</h1>
              </div>
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
            src="/images/artplaceholder.jpg"
            alt="placeholder"
            width={1500} // Adjust as needed
            height={500} // This sets the height of the image
          />
        </div>
      </section>}
      <main style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ maxWidth: '60rem', width: '100%' }}>
          {children}
        </div>
      </main>
        {!home && (
          <div className={styles.backToHome}>
            <Link href="/">← Back to home</Link>
          </div>
        )}
      </div>
    </SettingsProvider>
  );
}
