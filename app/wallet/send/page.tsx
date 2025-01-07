'use client';

import ProtectedPage from '@/app/protectedPage';
import Alert from '@/app/ui/alert';
import AppHeader from '@/app/ui/appHeader';
import Button from '@/app/ui/button';
import Card from '@/app/ui/card';
import { KeyValueDisplay } from '@/app/ui/keyValueDisplay';
import { userGetPubkey } from '@/app/user';
import {
  Center,
  Container,
  LoadingOverlay,
  Modal,
  NumberInput,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { EcdsaPublicKey } from '@sodot/sodot-web-sdk-demo';
import { useWindowSize } from '@uidotdev/usehooks';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { toast } from 'sonner';

import { createSignedTransaction } from '../../ethereum/etherUtils';

//check if the value is a substring of a valid hex address
function isValidAddressInput(value: string): boolean {
  if (value === '0' || value === '' || value === '0x') {
    return true;
  }
  const hexRegex = /^0x[0-9a-fA-F]*$/;
  return hexRegex.test(value);
}

export default function Page(): ReactNode {
  const { width, height } = useWindowSize();
  const router = useRouter();
  const [success, setSuccess] = useState<boolean>(false);
  const [amount, setAmount] = useState<number | string>('');
  const [loading, setLoaing] = useState<boolean>(false);
  const [recipientAddress, setRecipientAddress] = useState<string>('0x');
  const [error, setError] = useState<string>('');
  const [transactionHash, setTransactionHash] = useState<string>('');
  const [opened, { open, close }] = useDisclosure(false);

  const [pubkey, setPubkey] = useState<EcdsaPublicKey | null>(null);
  const onSend = async () => {
    // setShowSendModal(true);
    if (typeof amount !== 'number') {
      setError('please enter an amount');
      return;
    }
    try {
      const hash = await createSignedTransaction(amount, recipientAddress, pubkey);
      setTransactionHash(hash);
      setSuccess(true);
      open();
      toast('balance will be updated shortly, press on screen to go back');
    } catch (e) {
      if (e instanceof Error && 'code' in e) {
        switch (e.code) {
          case 'INSUFFICIENT_FUNDS':
            setError('You do not have enough funds to complete this transaction');
            break;
          case 'INVALID_ARGUMENT':
            setError('Amount is too low');
        }
      } else {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('An unknown error occurred');
        }
      }

      return;
    }
  };
  useEffect(() => {
    const fetchPubkey = async () => {
      setPubkey(await userGetPubkey());
    };
    fetchPubkey();
  }, [recipientAddress]);

  return (
    <ProtectedPage>
      <AppHeader>
        <Center>
          <Title>Send Using Ethereum</Title>
        </Center>

        <div style={{ marginTop: '10px' }}>
          <Card>
            Add amount of ETH and receiver address
            <div style={{ height: '10px' }}></div>
            <Container>
              <TextInput
                label='Address'
                description='Enter recipient address (0x...)'
                placeholder=''
                value={recipientAddress}
                required={true}
                onChange={(event) => {
                  const newVal = event.currentTarget.value;
                  if (newVal.length === 0) {
                    setRecipientAddress('0x');
                  }
                  if (isValidAddressInput(newVal)) {
                    setRecipientAddress(event.currentTarget.value);
                  }
                }}
              />
            </Container>
            <Container>
              <NumberInput
                allowNegative={false}
                allowLeadingZeros={false}
                label='Amount'
                description='Enter amount of ETH to send'
                placeholder=''
                value={amount}
                required={true}
                step={0.0001}
                onChange={setAmount}
              />{' '}
            </Container>
            <Button
              onClick={async () => {
                setLoaing(true);
                await onSend();
                setLoaing(false);
              }}
            >
              Confirm Send
            </Button>
          </Card>
        </div>

        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'purple', type: 'bars' }}
        />

        <Modal
          opened={opened}
          onClose={() => {
            close();
            router.push('/wallet');
          }}
          centered
          size='lg'
          withCloseButton
        >
          <Center>
            <Title>Send Completed Successfully</Title>
          </Center>
          <KeyValueDisplay keyName='Transaction Hash' value={transactionHash}></KeyValueDisplay>
          <Center>
            <a href={`https://sepolia.etherscan.io/tx/${transactionHash}`} target='_blank'>
              <Text
                size='xl'
                fw={900}
                variant='gradient'
                gradient={{ from: 'lime', to: 'teal', deg: 90 }}
              >
                Click Me To Check Transaction Status On Etherscan!
              </Text>
            </a>
          </Center>
        </Modal>

        {success && (
          <Confetti
            width={width || 0}
            numberOfPieces={800}
            height={height || 0}
            gravity={0.1}
            friction={1}
            colors={['#d000ff', '#f7b5f7', '#c53efa', '#f7a1f0', '#ff8c00']}
          />
        )}

        <Alert message={error} setMessage={setError}></Alert>
      </AppHeader>
    </ProtectedPage>
  );
}
