import { Button as MantineButton } from '@mantine/core';
import clsx from 'clsx';
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export default function Button({ children, className, ...rest }: ButtonProps): React.ReactElement {
  return (
    <MantineButton
      variant='gradient'
      gradient={{ from: 'grape', to: 'violet', deg: 180 }}
      className={clsx(
        'rounded-full m-4',
        // Tailwind classes for white background, black text, and elliptical shape
        className, // Include additional classes passed to the component
      )}
      {...rest}
    >
      {children}
    </MantineButton>
  );
}
