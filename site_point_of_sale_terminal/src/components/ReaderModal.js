import React, { useState, useEffect } from 'react';
import { useTerminal } from '../context/TerminalContext';

function ReaderModal({ onClose }) {
  const { 
    reader,
    connectionStatus,
    isConnected,
    discoverReaders, 
    connectToReader, 
    disconnectReader,
    initializeTerminal
  } = useTerminal();

  const [discoveredReaders, setDiscoveredReaders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (connectionStatus === 'initialized' || connectionStatus === 'not_connected') {
      handleDiscover();
    }
  }, [connectionStatus]);

  const handleDiscover = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const readers = await discoverReaders();
      setDiscoveredReaders(readers);
      
      if (readers.length === 0) {
        setError('No readers found. Make sure your reader is powered on and connected to the network.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (selectedReader) => {
    setLoading(true);
    setError(null);
    
    try {
      const success = await connectToReader(selectedReader);
      if (success) {
        onClose();
      } else {
        setError('Failed to connect to reader');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await disconnectReader();
      handleDiscover();
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'online':
        return <span style={{ color: '#28a745' }}>● Online</span>;
      case 'offline':
        return <span style={{ color: '#dc3545' }}>● Offline</span>;
      default:
        return <span style={{ color: '#6c757d' }}>● {status}</span>;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2>Card Reader</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {/* Current Connection */}
          {isConnected && reader && (
            <div style={{ 
              background: '#d4edda', 
              padding: '16px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <div style={{ fontWeight: '600', marginBottom: '8px', color: '#155724' }}>
                ✅ Connected
              </div>
              <div style={{ marginBottom: '4px' }}>
                <strong>Reader:</strong> {reader.label || reader.id}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Status:</strong> {getStatusBadge(reader.status)}
              </div>
              <button 
                className="btn btn-danger"
                onClick={handleDisconnect}
                disabled={loading}
              >
                Disconnect
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{ 
              background: '#f8d7da', 
              color: '#721c24',
              padding: '12px', 
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          {/* Available Readers */}
          {!isConnected && (
            <>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <h3 style={{ margin: 0 }}>Available Readers</h3>
                <button 
                  className="btn btn-secondary"
                  onClick={handleDiscover}
                  disabled={loading}
                >
                  {loading ? 'Searching...' : 'Refresh'}
                </button>
              </div>

              {loading && discoveredReaders.length === 0 ? (
                <div className="loading">
                  <div className="spinner"></div>
                  <span>Searching for readers...</span>
                </div>
              ) : discoveredReaders.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px 20px',
                  color: '#6c757d'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📡</div>
                  <div>No readers found</div>
                  <div style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                    Make sure your reader is powered on and connected to WiFi
                  </div>
                </div>
              ) : (
                <div>
                  {discoveredReaders.map(discoveredReader => (
                    <div 
                      key={discoveredReader.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '16px',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600' }}>
                          {discoveredReader.label || 'Stripe Reader'}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                          {discoveredReader.device_type} • {discoveredReader.serial_number}
                        </div>
                        <div style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                          {getStatusBadge(discoveredReader.status)}
                        </div>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleConnect(discoveredReader)}
                        disabled={loading || discoveredReader.status === 'offline'}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Help Text */}
          <div style={{ 
            marginTop: '20px', 
            padding: '16px', 
            background: '#f8f9fa',
            borderRadius: '8px',
            fontSize: '0.875rem',
            color: '#6c757d'
          }}>
            <strong>Need help?</strong>
            <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
              <li>Ensure the reader is powered on and has a solid green light</li>
              <li>The reader must be connected to the same WiFi network</li>
              <li>If using a new reader, register it in the Stripe Dashboard first</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReaderModal;
