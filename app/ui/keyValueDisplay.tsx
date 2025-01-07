import { ActionIcon, Container, Flex, ScrollArea } from '@mantine/core';
import { IconCopy } from '@tabler/icons-react';
import { ReactNode } from 'react';
import { toast } from 'sonner';

interface KeyValueDisplayProps {
  keyName: string;
  value: ReactNode;
}

export function KeyValueDisplay({ keyName, value }: KeyValueDisplayProps): ReactNode {
  const handleCopyToClipboard = () => {
    if (typeof value === 'string' || typeof value === 'number') {
      navigator.clipboard.writeText(value.toString());
      toast('Copied to clipboard');
    }
  };

  return (
    <div className='m-1'>
      {/* Key Name */}
      <Container
        size='responsive'
        style={{
          boxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.05)',
          borderRadius: '8px',
        }}
      >
        <div className='font-bold text-lg mb-2'>{keyName}</div>
        <Flex>
          <ActionIcon
            variant='light'
            size='lg'
            aria-label='Gradient action icon'
            onClick={handleCopyToClipboard}
            title='Copy to clipboard'
          >
            <IconCopy />
          </ActionIcon>
          <div style={{ width: '7px' }}></div>
          <ScrollArea h={50} scrollHideDelay={0} scrollbarSize={6}>
            {value}
          </ScrollArea>
        </Flex>
      </Container>
    </div>
  );
}
