import React, { ReactNode } from 'react';

interface TitleCardProps {
  children: React.ReactNode;
}

export default function TextCard({ children }: TitleCardProps): ReactNode {
  return (
    <div className='title-card p-6 bg-white rounded-lg shadow-md'>
      <h1 className='text-2xl font-bold text-gray-800'>{children}</h1>
    </div>
  );
}
