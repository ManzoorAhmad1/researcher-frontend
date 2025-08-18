'use client';

import { redirect } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader } from "rizzui";
const withPublicAuth = (WrappedComponent: any) => {
  const AuthenticatedComponent = (props: any) => {
    const [isAuthenticated, setAuthenticated] = useState(false);
    const [isLoading, setLoading] = useState(true);

    useEffect(() => {
      const tokenString = localStorage.getItem('token');
      const isToken = !!tokenString;

      if (isToken) {
        redirect('/dashboard');
      } else {
        setAuthenticated(isToken);
        setLoading(false);
      }
    }, []);

    if (isLoading) {
      return <div className='w-screen h-screen flex items-center justify-center text-[#9b9d9f]'>Loading
        <Loader
          variant="threeDot"
          size="lg"
          className="ms-1 pt-[10px]"
        /></div>;
    }

    return isAuthenticated ? null : <WrappedComponent {...props} />;
  };

  return AuthenticatedComponent;
};

export default withPublicAuth;
