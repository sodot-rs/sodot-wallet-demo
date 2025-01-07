import { GITHUB_REPO, SODOT_WEBSITE } from '@/consts';
import githubLogo from '@/public/githubLogo.png';
import sodotLogoName from '@/public/sodotLogoName.png';
import { Center, Flex, Title } from '@mantine/core';
import Image from 'next/image';
import { ReactElement } from 'react';

export default function AppTitle(): ReactElement {
  return (
    <div style={{ background: 'rgba(249, 230, 242, 0.5)' }}>
      <div style={{ height: '10px' }}></div>
      <Flex justify='space-between' align='end'>
        <div style={{ maxWidth: '160px', marginLeft: '10px' }}>
          <a href={SODOT_WEBSITE}>
            <Image src={sodotLogoName} alt='' />
          </a>
        </div>

        <div style={{ maxWidth: '50px', marginRight: '10px' }}>
          <a href={GITHUB_REPO}>
            <Image src={githubLogo} alt='' />
          </a>
        </div>
      </Flex>
      <Center>
        <Title order={1} lineClamp={1}>
          Wallet Demo
        </Title>
      </Center>
      <div style={{ height: '10px' }}></div>
    </div>
  );
}
