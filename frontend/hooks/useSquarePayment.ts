// src/hooks/useSquarePayment.ts
import { useState, useEffect, useRef } from 'react';

export interface UseSquarePaymentReturn {
  isLoaded: boolean;
  error: string | null;
  tokenize: () => Promise<{ token: string; details: any } | null>;
  scriptLoaded: boolean;
}

export const useSquarePayment = (
  applicationId: string,
  locationId: string,
  shouldInitialize: boolean = true
): UseSquarePaymentReturn => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const cardRef = useRef<any>(null);
  const isInitializing = useRef(false);

  // Step 1: Load Square script
  useEffect(() => {
    const loadSquareScript = () => {
      return new Promise<void>((resolve, reject) => {
        // Check if Square is already loaded
        if ((window as any).Square) {
          console.log('Square already loaded');
          resolve();
          return;
        }

        const existingScript = document.querySelector('script[src*="square.js"]');
        if (existingScript) {
          console.log('Script tag exists, waiting for Square...');
          const checkSquare = setInterval(() => {
            if ((window as any).Square) {
              clearInterval(checkSquare);
              resolve();
            }
          }, 100);
          setTimeout(() => {
            clearInterval(checkSquare);
            if (!(window as any).Square) {
              reject(new Error('Square script timeout'));
            }
          }, 10000);
          return;
        }

        console.log('Loading Square script...');
        const script = document.createElement('script');
        script.src = 'https://sandbox.web.squarecdn.com/v1/square.js';
        script.async = true;
        
        script.onload = () => {
          console.log('Square script loaded');
          resolve();
        };
        
        script.onerror = () => {
          console.error('Failed to load Square script');
          reject(new Error('Failed to load Square SDK'));
        };

        document.head.appendChild(script);
      });
    };

    loadSquareScript()
      .then(() => setScriptLoaded(true))
      .catch((e) => {
        console.error('Script loading error:', e);
        setError(e.message);
      });
  }, []);

  // Step 2: Initialize card when ready
  useEffect(() => {
    console.log('Init check:', { 
      shouldInitialize, 
      scriptLoaded, 
      isLoaded, 
      containerExists: !!document.getElementById('card-container'),
      isInitializing: isInitializing.current
    });
    
    if (!shouldInitialize) {
      console.log('shouldInitialize is false, skipping');
      return;
    }
    
    if (!scriptLoaded) {
      console.log('scriptLoaded is false, skipping');
      return;
    }
    
    if (isLoaded) {
      console.log('Already loaded, skipping');
      return;
    }

    let isMounted = true;

    const initializeSquare = async () => {
      if (isInitializing.current) {
        console.log('Already initializing');
        return;
      }

      // Pre-check: verify container exists before starting
      const preCheck = document.getElementById('card-container');
      if (!preCheck) {
        console.error('Pre-check failed: container does not exist yet!');
        setError('Payment form container not ready');
        return;
      }

      isInitializing.current = true;
      console.log('Starting Square card initialization...');
      console.log('DOM check:', document.getElementById('card-container'));
      console.log('All divs with id:', document.querySelectorAll('[id="card-container"]'));

      try {
        // Wait for container with timeout
        let attempts = 0;
        const maxAttempts = 30; // 3 seconds total
        
        while (attempts < maxAttempts && isMounted) {
          const container = document.getElementById('card-container');
          console.log(`Attempt ${attempts + 1}:`, {
            containerFound: !!container,
            containerHTML: container?.outerHTML?.substring(0, 100),
            allElements: document.querySelectorAll('[id*="card"]').length
          });
          
          if (container) {
            console.log('Container found, creating payments...');
            
            const payments = (window as any).Square.payments(applicationId, locationId);
            console.log('Payments created, creating card...');
            
            const card = await payments.card();
            console.log('Card created, attaching...');
            
            await card.attach('#card-container');
            console.log('Card attached successfully!');

            if (isMounted) {
              cardRef.current = card;
              setIsLoaded(true);
              setError(null);
            }
            return;
          }
          
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (isMounted) {
          console.error('Failed after all attempts. Final DOM state:', {
            container: document.getElementById('card-container'),
            bodyChildren: document.body.children.length,
            allIds: Array.from(document.querySelectorAll('[id]')).map(el => el.id)
          });
          throw new Error('Card container not found after waiting');
        }
      } catch (e: any) {
        console.error('Square initialization error:', e);
        if (isMounted) {
          setError(e.message || 'Failed to initialize payment form');
          setIsLoaded(false);
        }
      } finally {
        isInitializing.current = false;
      }
    };

    initializeSquare();

    return () => {
      isMounted = false;
    };
  }, [shouldInitialize, scriptLoaded, isLoaded, applicationId, locationId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cardRef.current) {
        try {
          cardRef.current.destroy();
          console.log('Card destroyed');
        } catch (e) {
          console.error('Error destroying card:', e);
        }
        cardRef.current = null;
      }
    };
  }, []);

  const tokenize = async (): Promise<{ token: string; details: any } | null> => {
    if (!cardRef.current) {
      console.error('Card ref not available');
      setError('Payment form not initialized');
      return null;
    }

    try {
      console.log('Tokenizing card...');
      const result = await cardRef.current.tokenize();
      console.log('Tokenize result:', result);
      
      if (result.status === 'OK') {
        return {
          token: result.token,
          details: result.details
        };
      } else {
        let errorMessage = 'Payment tokenization failed';
        
        if (result.errors) {
          errorMessage = result.errors.map((e: any) => e.message).join(', ');
        }
        
        setError(errorMessage);
        return null;
      }
    } catch (e: any) {
      console.error('Tokenization error:', e);
      setError(e.message || 'Failed to tokenize payment');
      return null;
    }
  };

  return {
    isLoaded,
    error,
    tokenize,
    scriptLoaded
  };
};