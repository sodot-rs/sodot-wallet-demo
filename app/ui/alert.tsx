import { Alert as MantineAlert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { ReactElement, useEffect } from 'react';

export default function Alert({
  message,
  setMessage,
}: {
  message: string;
  setMessage: (_message: string) => void;
}): ReactElement {
  const icon = <IconInfoCircle />;
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMessage('');
    }, 3000);
    return () => {
      clearTimeout(timeout);
    };
  }, [message, setMessage]);
  return (
    <div className='max-w-md mx-auto'>
      {message !== '' && (
        <MantineAlert
          variant='filled'
          color='red'
          radius='md'
          withCloseButton
          title='Error'
          onClose={() => {
            setMessage('');
          }}
          icon={icon}
        >
          {message}
        </MantineAlert>
      )}
    </div>
  );
}
