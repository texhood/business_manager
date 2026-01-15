import React, { useState, useEffect } from 'react';
import { useTerminal } from '../context/TerminalContext';

function ReaderModal({ onClose }) {
  const {
    reader,
    isConnected,
    connectionStatus,
    availableReaders,
    discoverReaders,
    connectReader,
    disconnectReader
  } = useTerminal();

  const [discovering, setDiscovering] = useState(false);

  useEffect(() => {
    handleDiscover();
  }, []);

  const handleDiscover = async () => {
    setDiscovering(true);
    await discoverReaders();
    setDiscovering(false);
  };

  const handleConnect = async (selectedReader) => {
    const success = await connectReader(selectedReader);
    if (success) {
      onClose();
    }
  };

  const handleDisconnect = async () => {
    await disconnectReader();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Card Reader</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {isConnected && reader && (
            <div className="reader-item connected">
              <div className="reader-info">
                <h4>{reader.label || 'Card Reader'}</h4>
                <p>Connected</p>
              </div>
              <button className="btn btn-danger" onClick={handleDisconnect}>
                Disconnect
              </button>
            </div>
          )}

          {!isConnected && (
            <>
              <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#6c757d' }}>
                  {discovering ? 'Discovering readers...' : `${availableReaders.length} reader(s) found`}
                </span>
                <button 
                  className="btn btn-secondary" 
                  onClick={handleDiscover}
                  disabled={discovering}
                >
                  {discovering ? 'Searching...' : 'Refresh'}
                </button>
              </div>

              <div className="reader-list">
                {availableReaders.length === 0 && !discovering && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                    <p>No readers found</p>
                    <p style={{ fontSize: '0.85rem' }}>
                      Make sure your reader is powered on and in pairing mode.
                    </p>
                  </div>
                )}

                {availableReaders.map((r) => (
                  <div
                    key={r.id}
                    className="reader-item"
                    onClick={() => handleConnect(r)}
                  >
                    <div className="reader-info">
                      <h4>{r.label || 'Card Reader'}</h4>
                      <p>{r.device_type} • {r.serial_number}</p>
                    </div>
                    <span className={`reader-status-text ${r.status === 'online' ? 'online' : 'offline'}`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}

          {connectionStatus === 'connecting' && (
            <div className="loading" style={{ marginTop: '16px' }}>
              <div className="spinner"></div>
              <span>Connecting...</span>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReaderModal;
