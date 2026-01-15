import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadStripeTerminal } from '@stripe/terminal-js';
import { useAuth } from './AuthContext';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const TerminalContext = createContext(null);

export function TerminalProvider({ children }) {
  const { token } = useAuth();
  const [terminal, setTerminal] = useState(null);
  const [reader, setReader] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('not_initialized');
  const [availableReaders, setAvailableReaders] = useState([]);

  // Fetch connection token from backend
  const fetchConnectionToken = useCallback(async () => {
    const response = await fetch(`${API_URL}/restaurant-pos/connection-token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch connection token');
    }

    const data = await response.json();
    return data.secret;
  }, [token]);

  // Initialize terminal
  useEffect(() => {
    if (!token) return;

    const initTerminal = async () => {
      try {
        const stripeTerminal = await loadStripeTerminal();
        
        const term = stripeTerminal.create({
          onFetchConnectionToken: fetchConnectionToken,
          onUnexpectedReaderDisconnect: () => {
            console.log('Reader disconnected unexpectedly');
            setIsConnected(false);
            setReader(null);
            setConnectionStatus('disconnected');
          },
        });

        setTerminal(term);
        setConnectionStatus('initialized');
      } catch (error) {
        console.error('Error initializing terminal:', error);
        setConnectionStatus('error');
      }
    };

    initTerminal();
  }, [token, fetchConnectionToken]);

  // Discover readers
  const discoverReaders = useCallback(async () => {
    if (!terminal) return [];

    setConnectionStatus('discovering');

    try {
      const config = { simulated: process.env.NODE_ENV === 'development' };
      const discoverResult = await terminal.discoverReaders(config);

      if (discoverResult.error) {
        console.error('Error discovering readers:', discoverResult.error);
        setConnectionStatus('error');
        return [];
      }

      setAvailableReaders(discoverResult.discoveredReaders);
      setConnectionStatus('initialized');
      return discoverResult.discoveredReaders;
    } catch (error) {
      console.error('Error discovering readers:', error);
      setConnectionStatus('error');
      return [];
    }
  }, [terminal]);

  // Connect to reader
  const connectReader = useCallback(async (selectedReader) => {
    if (!terminal) return false;

    setConnectionStatus('connecting');

    try {
      const connectResult = await terminal.connectReader(selectedReader);

      if (connectResult.error) {
        console.error('Error connecting to reader:', connectResult.error);
        setConnectionStatus('error');
        return false;
      }

      setReader(connectResult.reader);
      setIsConnected(true);
      setConnectionStatus('connected');
      return true;
    } catch (error) {
      console.error('Error connecting to reader:', error);
      setConnectionStatus('error');
      return false;
    }
  }, [terminal]);

  // Disconnect reader
  const disconnectReader = useCallback(async () => {
    if (!terminal || !isConnected) return;

    try {
      await terminal.disconnectReader();
      setReader(null);
      setIsConnected(false);
      setConnectionStatus('initialized');
    } catch (error) {
      console.error('Error disconnecting reader:', error);
    }
  }, [terminal, isConnected]);

  // Collect payment
  const collectPayment = useCallback(async (paymentIntentClientSecret) => {
    if (!terminal || !isConnected) {
      throw new Error('No reader connected');
    }

    const result = await terminal.collectPaymentMethod(paymentIntentClientSecret);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  }, [terminal, isConnected]);

  // Process payment
  const processPayment = useCallback(async (paymentIntent) => {
    if (!terminal || !isConnected) {
      throw new Error('No reader connected');
    }

    const result = await terminal.processPayment(paymentIntent);

    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.paymentIntent;
  }, [terminal, isConnected]);

  // Cancel collect
  const cancelCollect = useCallback(async () => {
    if (!terminal) return;

    try {
      await terminal.cancelCollectPaymentMethod();
    } catch (error) {
      console.error('Error canceling collection:', error);
    }
  }, [terminal]);

  const value = {
    terminal,
    reader,
    isConnected,
    connectionStatus,
    availableReaders,
    discoverReaders,
    connectReader,
    disconnectReader,
    collectPayment,
    processPayment,
    cancelCollect
  };

  return (
    <TerminalContext.Provider value={value}>
      {children}
    </TerminalContext.Provider>
  );
}

export function useTerminal() {
  const context = useContext(TerminalContext);
  if (!context) {
    throw new Error('useTerminal must be used within a TerminalProvider');
  }
  return context;
}
