import clsx from 'clsx';
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps): React.ReactElement {
  // Extract the first child as the title and the rest as the body content
  const [title, ...body] = React.Children.toArray(children);

  return (
    <div className='flex justify-center'>
      <div
        className={clsx(
          'm-4 inline-block max-w-full min-w-[300px] rounded-lg bg-gradient-to-r',
          'from-purple-400 via-pink-500 to-orange-500 p-[2px] shadow-md overflow-auto',
          // Gradient border
          className,
        )}
      >
        <div className='bg-white rounded-lg overflow-hidden'>
          {/* Title Section */}
          <div className='flex items-center justify-center h-24 p-4 border-b border-gray-200'>
            <h2 className='text-2xl font-extrabold text-gray-600 tracking-tight'>{title}</h2>
          </div>

          {/* Body Section */}
          <div>
            <div className='text-left'>{body}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
