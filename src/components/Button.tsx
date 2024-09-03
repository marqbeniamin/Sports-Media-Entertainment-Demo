import React, { ReactNode } from 'react';

type ButtonProps = {
  onClick: () => void;
  children: ReactNode;
};

const Button: React.FC<ButtonProps> = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-lg bg-primary text-white"
    >
      {children}
    </button>
  );
};

export default Button;