'use client';

import React from 'react';
import { useLoader } from './LoaderContext';
import Typewriter from 'typewriter-effect';
import { Loader } from "rizzui";


const FullScreenLoader: React.FC = () => {
  const { loading, loaderMessage } = useLoader();

  if (!loading) return null;

  return (
   <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 z-50">
   <div className="loader mb-4"></div>
   {loaderMessage!==''?(<span className="text-white text-lg">
     <Typewriter
       options={{
         strings: loaderMessage,
         autoStart: true,
         loop: true,
         deleteSpeed: 70,
         wrapperClassName: 'head_tags',
       }}
     />
   </span>): <Loader variant="threeDot" size="lg" />}
 </div>
  );
};


export default FullScreenLoader;
