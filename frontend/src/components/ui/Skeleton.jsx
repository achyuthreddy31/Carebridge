import React from 'react';
import './Skeleton.css';

export const Skeleton = ({
  variant = 'text', // text, circle, card, rect
  width,
  height,
  className = '',
}) => {
  const style = {
    width: width || (variant === 'circle' ? '40px' : '100%'),
    height: height || (variant === 'text' ? '1rem' : variant === 'circle' ? '40px' : '120px'),
  };

  return (
    <div
      className={`curasync-skeleton curasync-skeleton--${variant} ${className}`}
      style={style}
    />
  );
};
