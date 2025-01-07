import React, { ReactNode } from 'react';

interface TitleCardProps {
  children: React.ReactNode;
}

export default function Title({ children }: TitleCardProps): ReactNode {
  return (
    <h2 className='m-auto text-2xl font-extrabold text-gray-600 tracking-tight text-center'>
      {children}
    </h2>
  );
}
