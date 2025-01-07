'use client';

import { login } from '@/app/fetch';
import passkeyIcon from '@/public/passkeyIcon.png';
import {
  ActionIcon,
  Center,
  Container,
  Dialog,
  Flex,
  LoadingOverlay,
  MantineProvider,
  TextInput,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { useDisclosure } from '@mantine/hooks';
import { IconKey, IconPlus } from '@tabler/icons-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { ReactNode, useEffect, useState } from 'react';

import { authenticate, registerCredential } from './passkey';
import Alert from './ui/alert';
import AppTitle from './ui/appTitle';
import Button from './ui/button';
import Card from './ui/card';
import GoogleLoginComponent from './ui/googleLoginComponent';
import Title from './ui/title';
import { userClear, userInit } from './user';

export default function Page(): ReactNode {
  const [opened, { toggle, close }] = useDisclosure(false);
  const [loading, setLoaing] = useState<boolean>(false);
  const [passkeyName, setPasskeyName] = useState<string>('');
  const [error, setError] = useState<string>('');
  useEffect(() => {
    //user cant stay logged in while in login page
    userClear();
  }, []);

  const router = useRouter();
  const onGoogleLoginSuccess = async (accessTokenDrive: string, accessTokenProfile: string) => {
    setLoaing(true);
    let token;
    try {
      token = await login(accessTokenProfile);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError('An unknown error occurred');
      }
      setLoaing(false);
      return;
    }
    await userInit(token, accessTokenDrive);
    router.push('wallet');
    setLoaing(false);
  };

  const onPasskeySignIn = async () => {
    setLoaing(true);
    try {
      await authenticate();
      router.push('wallet');
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === 'NotAllowedError') {
          return;
        }
        setError(e.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoaing(false);
    }
  };

  const passkeyCreate = async (name: string) => {
    try {
      await registerCredential(name);
    } catch (e) {
      if (e instanceof Error) {
        if (e.name === 'NotAllowedError') {
          return;
        }
        setError(e.message);
      } else {
        setError('An unknown error occurred');
      }
    }
  };

  return (
    <MantineProvider>
      <AppTitle></AppTitle>
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'purple', type: 'bars' }}
      />
      <Flex mih={50} gap='l' justify='center' align='flex-start' direction='row' wrap='wrap'>
        <Title>Choose a login method</Title>
      </Flex>
      <Flex mih={50} gap='l' justify='center' align='flex-start' direction='row' wrap='wrap'>
        <GoogleLoginComponent
          onSuccess={(accessTokenDrive: string, accessTokenProfile: string) => {
            void onGoogleLoginSuccess(accessTokenDrive, accessTokenProfile);
          }}
        ></GoogleLoginComponent>
        <Card>
          <span className='flex items-center justify-between gap-2 w-full'>
            <div className='text-left'>Passkey</div>
            <Image src={passkeyIcon} width={32} height={32} alt='Passkey Icon' />
          </span>
          <Center>
            <Button
              onClick={() => {
                void (async () => {
                  await onPasskeySignIn();
                })();
              }}
            >
              Sign In
            </Button>
            <Button onClick={toggle}>Create New</Button>
          </Center>
        </Card>
      </Flex>
      <Alert message={error} setMessage={setError}></Alert>

      <Dialog
        opened={opened}
        withCloseButton={true}
        withBorder={true}
        onClose={() => {
          setPasskeyName('');
          close();
        }}
        size='lg'
        radius='md'
        position={{ top: 10, left: 10 }}
      >
        <Container size='responsive'>
          Name your wallet!
          <Flex align='center' gap='sm'>
            <TextInput
              value={passkeyName}
              onChange={(event) => {
                setPasskeyName(event.currentTarget.value);
              }}
            />
            <ActionIcon
              variant='gradient'
              size='lg'
              aria-label='Gradient action icon'
              gradient={{ from: 'green', to: 'lime', deg: 90 }}
              onClick={() => {
                void passkeyCreate(passkeyName);
                close();
              }}
            >
              <IconPlus />
              <IconKey></IconKey>
            </ActionIcon>
          </Flex>
        </Container>
      </Dialog>
    </MantineProvider>
  );
}
