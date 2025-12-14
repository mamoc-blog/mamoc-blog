import utilStyles from '../../styles/utils.module.css';
import styles from '../../styles/post.module.scss';
import Image from 'next/image';
import SocialLinks from './SocialLinks';
import PostCard from './PostCard';

export default function AuthorSection({ authorData, posts }) {
    if (!authorData) return null;

    return (
        <>
            <div className={styles.authorHeader}>
                <h2 className={`${utilStyles.headingLg} ${styles.authorName}`}>{authorData.name}</h2>
            </div>

            <div className={styles.authorMetaRow}>
                <Image
                    priority
                    src={authorData.image}
                    height={60}
                    width={60}
                    alt={authorData.name}
                    className={utilStyles.borderCircle}
                />
                <SocialLinks
                    github={authorData.links.github}
                    linkedin={authorData.links.linkedin}
                    cv={authorData.links.cv}
                />
            </div>

            <div className={utilStyles.postGrid}>
                {posts.map(({ id, date, title, summary, author }) => (
                    <div key={id} className={utilStyles.postCardWrapper}>
                        <PostCard
                            id={id}
                            date={date}
                            title={title}
                            summary={summary}
                            author={author}
                        />
                    </div>
                ))}
            </div>
        </>
    );
}
