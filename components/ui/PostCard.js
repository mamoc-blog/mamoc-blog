import Link from 'next/link';
import Date from '../date';
import styles from './PostCard.module.scss';
import { useSettingsContext } from '../utils/Theme';

export default function PostCard({ id, date, title, summary, author }) {
    // Use context to get theme if needed for inline styles, 
    // but CSS modules with variables handle most of it
    const { darkTheme } = useSettingsContext();

    return (
        <Link href={`/posts/${id}`} legacyBehavior>
            <a className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.date}>
                        <Date dateString={date} />
                    </div>
                </div>

                <div className={styles.content}>
                    <h3 className={styles.title}>{title}</h3>
                    <p className={styles.summary}>{summary}</p>
                </div>

            </a>
        </Link>
    );
}
