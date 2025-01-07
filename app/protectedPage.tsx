'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { userGetCredentials } from './user';

interface ProtectedPageProps {
  children: React.ReactNode;
}

const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = React.useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    if (!userGetCredentials()) {
      setIsAuthorized(false);
      router.push('/');
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  return <>{isAuthorized ? <>{children}</> : <div></div>}</>;
};

export default ProtectedPage;
