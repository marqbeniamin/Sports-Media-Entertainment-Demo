'use client';

import React, { ReactNode } from 'react';
import clsx from 'clsx';

type CardProps = {
  children: ReactNode;
  className?: string;
};

const Card: React.FC<CardProps> = ({ children, className }) => {
  return (
    <div
      className={clsx(
        "rounded-lg shadow-lg bg-gray-800 text-gray-200 p-4", // Dark theme with subtle shadow
        className
      )}
    >
      {children}
    </div>
  );
};

export default Card;