import React, { Suspense } from 'react';

const SearchParamsWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            {children}
        </Suspense>
    );
};

export default SearchParamsWrapper;
