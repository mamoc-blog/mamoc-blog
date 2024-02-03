import React from 'react';
import styles from './Note.module.scss';

const Note = ({ children }) => {
  return (
    <div className={styles.noteContainer}>
      <strong>Note:</strong> {children}
    </div>
  );
};

export default Note;