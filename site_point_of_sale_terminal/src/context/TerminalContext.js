import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loadStripeTerminal } from '@stripe/terminal-js';
import { getHeaders } from '../services/api';

const API_URL = process.env.REACT_APP_API_URL || '/api/v1';

const TerminalContext = createContext(null);

export function TerminalProvider({ children }) {
  const [terminal, setTerminal] = useState(null);
  const [reader, setReader] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('not_connected');
  const [readerStatus, setReaderStatus] = useState(null);
  const [error, setError] = useState(null);

  // Fetch connection token from backend
  const fetchConnectionToken = useCallback(async () => {
    const token = localStorage.getItem('pos_token');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/terminal/connection-token`, {
      method: 'POST',
      headers: getHeaders(token)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch connection token');
    }

    const data = await response.json();
    return data.secret;
  }, []);

  // Handle unexpected disconnect
  const handleUnexpectedReaderDisconnect = useCallback(() => {
    console.log('Reader disconnected unexpectedly');
    setReader(null);
    setConnectionStatus('not_connected');
    setReaderStatus(null);
  }, []);

  // Initialize Stripe Terminal
  const initializeTerminal = useCallback(async () => {
    try {
      const StripeTerminal = await loadStripeTerminal();
      
      const terminalInstance = StripeTerminal.create({
        onFetchConnectionToken: fetchConnectionToken,
        onUnexpectedReaderDisconnect: handleUnexpectedReaderDisconnect
      });

      setTerminal(terminalInstance);
      setConnectionStatus('initialized');
      console.log('Stripe Terminal initialized');
    } catch (err) {
      console.error('Failed to initialize terminal:', err);
      setError(err.message);
    }
  }, [fetchConnectionToken, handleUnexpectedReaderDisconnect]);

  // Discover readers
  const discoverReaders = useCallback(async () => {
    if (!terminal) return [];

    try {
      setConnectionStatus('discovering');
      const discoverResult = await terminal.discoverReaders({
        simulated: process.env.REACT_APP_STRIPE_SIMULATED === 'true'
      });

      if (discoverResult.error) {
        throw new Error(discoverResult.error.message);
      }

      console.log('Discovered readers:', discoverResult.discoveredReaders);
      return discoverResult.discoveredReaders;
    } catch (err) {
      console.error('Failed to discover readers:', err);
      setError(err.message);
      setConnectionStatus('not_connected');
      return [];
    }
  }, [terminal]);

  // Connect to a reader
  const connectToReader = useCallback(async (selectedReader) => {
    if (!terminal) return false;

    try {
      setConnectionStatus('connecting');
      const connectResult = await terminal.connectReader(selectedReader);

      if (connectResult.error) {
        throw new Error(connectResult.error.message);
      }

      setReader(connectResult.reader);
      setConnectionStatus('connected');
      setReaderStatus(connectResult.reader.status);
      console.log('Connected to reader:', connectResult.reader);
      return true;
    } catch (err) {
      console.error('Failed to connect to reader:', err);
      setError(err.message);
      setConnectionStatus('not_connected');
      return false;
    }
  }, [terminal]);

  // Disconnect from reader
  const disconnectReader = useCallback(async () => {
    if (!terminal) return;

    try {
      await terminal.disconnectReader();
      setReader(null);
      setConnectionStatus('not_connected');
      setReaderStatus(null);
    } catch (err) {
      console.error('Failed to disconnect:', err);
    }
  }, [terminal]);

  // Collect payment
  const collectPayment = useCallback(async (paymentIntentClientSecret) => {
    if (!terminal || !reader) {
      throw new Error('Reader not connected');
    }

    try {
      const result = await terminal.collectPaymentMethod(paymentIntentClientSecret);
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    } catch (err) {
      console.error('Failed to collect payment:', err);
      throw err;
    }
  }, [terminal, reader]);

  // Process payment
  const processPayment = useCallback(async (paymentIntent) => {
    if (!terminal) {
      throw new Error('Terminal not initialized');
    }

    try {
      const result = await terminal.processPayment(paymentIntent);
      
      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    } catch (err) {
      console.error('Failed to process payment:', err);
      throw err;
    }
  }, [terminal]);

  // Cancel collect payment
  const cancelCollectPayment = useCallback(async () => {
    if (!terminal) return;

    try {
      await terminal.cancelCollectPaymentMethod();
    } catch (err) {
      console.error('Failed to cancel collection:', err);
    }
  }, [terminal]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount when authenticated
  useEffect(() => {
    const token = localStorage.getItem('pos_token');
    if (token && !terminal) {
      initializeTerminal();
    }
  }, [initializeTerminal, terminal]);

  const value = {
    terminal,
    reader,
    connectionStatus,
    readerStatus,
    error,
    initializeTerminal,
    discoverReaders,
    connectToReader,
    disconnectReader,
    collectPayment,
    processPayment,
    cancelCollectPayment,
    clearError,
    isConnected: connectionStatus === 'connected'
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
