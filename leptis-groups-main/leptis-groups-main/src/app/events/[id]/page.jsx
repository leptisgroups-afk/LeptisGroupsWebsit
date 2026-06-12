"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Loader from '@/components/Loader';

export default function EventDetailRedirect() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to main /events page since details are viewed via modal
        router.replace('/events');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
            <Loader />
        </div>
    );
}
