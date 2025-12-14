import utilStyles from '../../styles/utils.module.css';
import utilStyles2 from '../../styles/utils2.module.scss';
import styles from '../../styles/post.module.scss';
import Date from '../date';
import Link from 'next/link';
import Image from 'next/image';
import SocialLinks from '../ui/SocialLinks';
import { getAuthorByName } from '../../data/authors';

export default function PostHeader({ title, author, date, summary, imageSrc, readingTime, toc }) {
    const authorData = getAuthorByName(author);

    return (
        <>
            <h1 className={`${utilStyles.headingXl} ${utilStyles2.pink}`}>{title}</h1>
            <div className={styles.summarySection}>
                <div className={styles.summaryGrid}>
                    <div className={styles.metadataColumn}>
                        <span className={`${styles.authorName} ${utilStyles.headingMd}`}>
                            <b>{author}</b>
                        </span>
                        <div className={`${utilStyles.lightText} ${styles.dateRow}`}>
                            <Date dateString={date} />
                            {readingTime && <span className={styles.readingTime}> • {readingTime}</span>}
                        </div>
                        <p><b>{summary}</b></p>
                        {authorData && (
                            <div className={styles.authorMetaRow}>
                                <Link href='.'>
                                    <Image
                                        priority
                                        src={authorData.image}
                                        height={50}
                                        width={50}
                                        alt={author}
                                        className={utilStyles.borderCircle}
                                    />
                                </Link>
                                <SocialLinks
                                    github={authorData.links.github}
                                    linkedin={authorData.links.linkedin}
                                    cv={authorData.links.cv}
                                />
                            </div>
                        )}
                    </div>

                    <div className={styles.tocColumn}>
                        {toc}
                    </div>

                    <div className={styles.imageColumn}>
                        <Image
                            priority
                            src={imageSrc}
                            alt={`Cover image for ${title}`}
                            width={640}
                            height={480}
                            className={styles.summaryImage}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
