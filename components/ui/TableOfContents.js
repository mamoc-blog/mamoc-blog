import { useState, useEffect } from 'react';
import styles from '../../styles/post.module.scss';

export default function TableOfContents() {
    const [toc, setToc] = useState([]);

    useEffect(() => {
        // Queries headers and builds the TOC structure
        const headings = Array.from(document.querySelectorAll('article h2, article h3, article h4, article h5, article h6'));
        const tocItems = headings.map((heading) => {
            const level = parseInt(heading.tagName.substring(1), 10);
            const bars = '|'.repeat(level - 2);

            if (!heading.id) {
                heading.id = heading.textContent.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
            }

            return {
                id: heading.id,
                title: `${bars} ${heading.textContent}`,
                level: heading.tagName.toLowerCase(),
            };
        });
        setToc(tocItems);
    }, []);

    return (
        <div className={styles.tableOfContents}>
            {toc.map(item => (
                <div key={item.id}>
                    <a href={`#${item.id}`}>
                        <small>{item.title}</small>
                    </a>
                </div>
            ))}
        </div>
    );
}
