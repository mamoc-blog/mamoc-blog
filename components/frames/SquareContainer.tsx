import React from 'react';
import classNames from 'classnames';
import styles from './SquareContainer.module.scss';

interface SquareContainerProps {
  className?: string;
  children?: React.ReactNode;
}

export const SquareContainer = ({ className, children }: SquareContainerProps) => {
  return (
    <div className={classNames(styles.root, className)}>
      <div className={classNames(styles.content)}>
        {children}
      </div>
    </div>
  );
};
