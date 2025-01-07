'use client';

import ethereumIcon from '@/public/ethereumIcon.png';
import { Center, LoadingOverlay, Title } from '@mantine/core';
import '@mantine/core/styles.css';
import { EcdsaKeygenResult } from '@sodot/sodot-web-sdk-demo';
import Image from 'next/image';
import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';

import { addressFromPublicKey, getBalance } from '../ethereum/etherUtils';
import generateKeys from '../mpc/keygen';
import getPubkey from '../mpc/pubkey';
import ProtectedPage from '../protectedPage';
import AppHeader from '../ui/appHeader';
import Button from '../ui/button';
import Card from '../ui/card';
import { KeyValueDisplay } from '../ui/keyValueDisplay';
import { userGetKeygenResult, userGetPubkey, userSetKeygenResult } from '../user';

export default function Page(): ReactNode {
  const [keygenResult, setKeygenResult] = useState<EcdsaKeygenResult | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      const result = userGetKeygenResult();
      setKeygenResult(result);
      const pubKey = await userGetPubkey();
      if (pubKey) {
        const _address = addressFromPublicKey(pubKey);
        setAddress(_address);
        const _balance = await getBalance(_address);
        setBalance(_balance);
      }
    };
    fetchData().then(() => {
      setLoading(false);
    });
  }, []);
  return (
    <AppHeader>
      <ProtectedPage>
        <LoadingOverlay
          visible={loading}
          zIndex={1000}
          overlayProps={{ radius: 'sm', blur: 2 }}
          loaderProps={{ color: 'purple', type: 'bars' }}
        />
        <Center>
          <Title>Wallet</Title>
        </Center>
        <div style={{ paddingTop: '10px' }}>
          <Card>
            <span className='flex items-center space-x-2'>
              <Image
                src={ethereumIcon}
                style={{ width: '25px', height: '25px' }}
                alt='Ethereum Icon'
              />
              <span>Ethereum Information</span>
            </span>
            <KeyValueDisplay
              keyName={'Address'}
              value={keygenResult ? address || '...' : 'Please generate keys'}
            />
            <div style={{ height: '10px' }}></div>
            <KeyValueDisplay
              keyName={'Balance'}
              value={keygenResult ? balance || '...' : 'Please generate keys'}
            />
            <Button
              onClick={async () => {
                setLoading(true);
                const res = await generateKeys();
                setKeygenResult(res);
                const pubKey = await getPubkey(res);
                userSetKeygenResult(res);
                const _address = addressFromPublicKey(pubKey);
                setAddress(_address);
                setBalance(await getBalance(_address));
                setLoading(false);
              }}
              style={{ display: keygenResult ? 'none' : 'block' }}
            >
              Generate keys
            </Button>
            <Button style={{ display: keygenResult ? 'block' : 'none' }}>
              <Link key={'wallet-send-page'} href={'wallet/send'}>
                Send
              </Link>
            </Button>
          </Card>
        </div>
      </ProtectedPage>
    </AppHeader>
  );
}
