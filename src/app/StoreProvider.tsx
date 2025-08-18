'use client'
import { makeStore, AppStore } from '@/reducer/store';
import { configureInterceptors } from '@/utils/request';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { Provider } from 'react-redux'; 

export default function StoreProvider({
    children
}: {
    children: React.ReactNode
}) {
    const router :any= useRouter()
    configureInterceptors(router)
    const storeRef = useRef<AppStore | undefined>(undefined);
    


    if (!storeRef.current) {
        storeRef.current = makeStore();
    }

    return <Provider store={storeRef.current.store}>{children}</Provider>;
}
