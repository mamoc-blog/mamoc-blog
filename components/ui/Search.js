import { Command } from 'cmdk';
import { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { useRouter } from 'next/router';
import styles from './Search.module.scss';
import { FaSearch } from "react-icons/fa";

export default function Search() {
    const [open, setOpen] = useState(false);
    const router = useRouter();
    const [posts, setPosts] = useState([]);

    // Toggle with Cmd+K
    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Fetch posts when modal opens
    useEffect(() => {
        if (open && posts.length === 0) {
            fetch('/search.json')
                .then((res) => res.json())
                .then((data) => setPosts(data))
                .catch((err) => console.error('Failed to load search index', err));
        }
    }, [open, posts.length]);

    // Fuse.js configuration
    const fuse = new Fuse(posts, {
        keys: ['title', 'description', 'tags'],
        threshold: 0.3,
    });

    const [results, setResults] = useState(posts);

    const handleSearch = (value) => {
        if (!value) {
            setResults(posts);
            return;
        }
        const searchResults = fuse.search(value);
        setResults(searchResults.map((result) => result.item));
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className={styles.searchButton}
                aria-label="Search posts"
            >
                <FaSearch />
                <span className={styles.searchHint}>⌘K</span>
            </button>

            {open && (
                <div className={styles.overlay} onClick={() => setOpen(false)}>
                    <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                        <Command label="Search Blog Posts" className={styles.command}>
                            <div className={styles.inputWrapper}>
                                <FaSearch className={styles.inputIcon} />
                                <Command.Input
                                    placeholder="Search posts..."
                                    onValueChange={handleSearch}
                                    className={styles.input}
                                    autoFocus
                                />
                            </div>

                            <Command.List className={styles.list}>
                                <Command.Empty className={styles.empty}>No results found.</Command.Empty>
                                {results.map((post) => (
                                    <Command.Item
                                        key={post.id}
                                        value={post.title}
                                        onSelect={() => {
                                            setOpen(false);
                                            router.push(`/posts/${post.id}`);
                                        }}
                                        className={styles.item}
                                    >
                                        <span className={styles.itemTitle}>{post.title}</span>
                                        {post.description && <span className={styles.itemDesc}>{post.description}</span>}
                                    </Command.Item>
                                ))}
                            </Command.List>
                        </Command>
                    </div>
                </div>
            )}
        </>
    );
}
