'use client';

import '@/app/ui/global.css';
import { GITHUB_REPO, SODOT_WEBSITE } from '@/consts';
import githubLogo from '@/public/githubLogo.png';
import sodotLogoName from '@/public/sodotLogoName.png';
import { Flex } from '@mantine/core';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode } from 'react';

import Button from '../ui/button';
import { userClear } from '../user';

export default function AppHeader({ children }: { children: ReactNode }): ReactNode {
  let url = '';
  if (typeof window !== 'undefined') {
    url = window.location.href;
  }
  const router = useRouter();
  function logOut(): void {
    userClear();
    router.push('/');
  }
  return (
    <>
      <div style={{ background: 'rgba(249, 230, 242, 0.5)' }}>
        <div style={{ height: '10px' }}></div>
        <Flex justify='space-between' align='center' style={{ width: '100%' }}>
          <div style={{ maxWidth: '150px', marginLeft: '15px' }}>
            <a href={SODOT_WEBSITE} target='_blank'>
              <Image src={sodotLogoName} alt='' />
            </a>
          </div>
          <Flex justify='end'>
            <div style={{ maxWidth: '50px', marginRight: '15px' }}>
              <a href={GITHUB_REPO} target='_blank'>
                <Image src={githubLogo} alt='' />
              </a>
            </div>
          </Flex>
        </Flex>
        <Flex justify='start'>
          <Button onClick={logOut} color='green'>
            Logout
          </Button>
          <div style={{ visibility: url.includes('send') ? 'visible' : 'hidden' }}>
            <Button>
              <Link key={'wallet'} href={'../wallet'}>
                Back
              </Link>
            </Button>
          </div>
        </Flex>
      </div>
      {children}
    </>
  );
}
