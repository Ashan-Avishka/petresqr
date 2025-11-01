'use client';

import { useState, useEffect } from 'react';

export const useIsMobile = (breakpoint: number = 768): boolean => {
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        // Check if window is defined (client-side)
        if (typeof window === 'undefined') return;

        // Initial check
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Check on mount
        checkMobile();

        // Add event listener for resize
        window.addEventListener('resize', checkMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile);
    }, [breakpoint]);

    return isMobile;
};

// Alternative: Media query based detection
export const useMediaQuery = (query: string): boolean => {
    const [matches, setMatches] = useState<boolean>(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const media = window.matchMedia(query);
        
        // Initial check
        setMatches(media.matches);

        // Listener for changes
        const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
        
        media.addEventListener('change', listener);

        return () => media.removeEventListener('change', listener);
    }, [query]);

    return matches;
};