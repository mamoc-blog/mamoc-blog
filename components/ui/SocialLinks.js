import Link from 'next/link';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { IoDocumentText } from 'react-icons/io5';
import styles from './SocialLinks.module.scss';

export default function SocialLinks({ github, linkedin, cv }) {
    return (
        <div className={styles.socialDock}>
            {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="GitHub">
                    <FaGithub />
                </a>
            )}
            {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                    <FaLinkedin />
                </a>
            )}
            {cv && (
                <a href={cv} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="CV">
                    <IoDocumentText />
                </a>
            )}
        </div>
    );
}
