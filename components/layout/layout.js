import Head from 'next/head';
import Image from 'next/image';
import styles from './layout.module.css';
import utilStyles from '../../styles/utils.module.css';
import Link from 'next/link';
import { SettingsProvider } from '../Theme';
import {DarkModeToggle} from '../DarkModeToggle';

const name = '';
export const siteTitle = 'MAMOC';

export default function Layout({ children, home }) {
  return (
    <SettingsProvider>
    <div className={styles.container}>
      <header className={styles.header}>
        {home ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', height: '144px', width: '144px' }}>
                <Image
                  priority
                  src="/images/cam.png"
                  className={utilStyles.borderCircle}
                  height={144}
                  width={144}
                  alt={name}
                />
              </div>
              <div style={{ position: 'relative', height: '144px', width: '144px' }}>
                <Image
                  priority
                  src="/images/alex.png"
                  className={utilStyles.borderCircle}
                  height={144}
                  width={144}
                  alt={name}
                />
              </div>
            </div>
            <h1 className={utilStyles.heading2Xl}>{name}</h1>

            <div>
              <DarkModeToggle/>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative', height: '108px', width: '108px' }}>
                <Link href="/">
                  <Image
                    priority
                    src="/images/cam.png"
                    className={utilStyles.borderCircle}
                    height={108}
                    width={108}
                    alt={name}
                  />
                </Link>
              </div>
              <div style={{ position: 'relative', height: '108px', width: '108px' }}>
                <Link href="/">
                  <Image
                    priority
                    src="/images/alex.png"
                    className={utilStyles.borderCircle}
                    height={108}
                    width={108}
                    alt={name}
                  />
                </Link>
              </div>
            </div>
            <h2 className={utilStyles.headingLg}>
              <Link href="/" className={utilStyles.colorInherit}>
                {name}
              </Link>
            </h2>
          </>
        )}
      </header>
      <main>{children}</main>
      {!home && (
        <div className={styles.backToHome}>
          <Link href="/">← Back to home</Link>
        </div>
      )}
    </div>
    </SettingsProvider>
  );
}
