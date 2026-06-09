"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function EditOffer() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to main /offers page since details are viewed via modal
        router.replace('/offers');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <Loader />
        </div>
    );
}
