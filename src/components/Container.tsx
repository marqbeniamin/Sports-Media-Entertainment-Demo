import React, { ReactNode } from 'react';

type ContainerProps = {
  children: ReactNode;
};

const Container: React.FC<ContainerProps> = ({ children }) => {
  return (
    <div className="max-w-screen-lg mx-auto px-4 bg-background">
      {children}
    </div>
  );
};

export default Container;