import React, { useState, useEffect } from 'react';
import { Card, Badge, Spinner } from 'react-bootstrap';
import { getSystemStatus } from '../services/api';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    status: 'loading',
    version: '0.0.0',
    uptime: 0,
    timestamp: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const response = await getSystemStatus();
      setStatus({
        status: response.data.status,
        version: response.data.version,
        uptime: response.data.uptime,
        timestamp: new Date()
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching system status:', err);
      setError('Unable to connect to the server');
      setStatus(prev => ({
        ...prev,
        status: 'error',
        timestamp: new Date()
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusVariant = () => {
    switch (status.status) {
      case 'ok':
        return 'success';
      case 'degraded':
        return 'warning';
      case 'error':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return [
      days > 0 && `${days}d`,
      hours > 0 && `${hours}h`,
      minutes > 0 && `${minutes}m`,
      `${secs}s`
    ].filter(Boolean).join(' ');
  };

  return (
    <Card className="border-0 shadow-sm h-100">
      <Card.Header className="bg-white border-0">
        <h4 className="mb-0 d-flex align-items-center">
          <i className="fas fa-server me-2 text-info"></i>
          <span>System Status</span>
          <Badge 
            bg={getStatusVariant()} 
            className="ms-2"
            style={{ 
              width: '10px', 
              height: '10px',
              padding: 0,
              borderRadius: '50%',
              position: 'relative',
              top: '-1px'
            }}
          >
            <span className="visually-hidden">
              {status.status === 'ok' ? 'Operational' : status.status}
            </span>
          </Badge>
        </h4>
      </Card.Header>
      <Card.Body className="p-4">
        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Checking system status...</span>
          </div>
        ) : error ? (
          <div className="text-center py-3 text-danger">
            <i className="fas fa-exclamation-circle me-2"></i>
            <span>{error}</span>
          </div>
        ) : (
          <div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Status</span>
              <div>
                <Badge bg={getStatusVariant()} className="text-capitalize">
                  {status.status || 'Unknown'}
                </Badge>
              </div>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Version</span>
              <span className="fw-medium">v{status.version}</span>
            </div>
            <div className="d-flex justify-content-between mb-3">
              <span className="text-muted">Uptime</span>
              <span className="fw-medium">{formatUptime(status.uptime)}</span>
            </div>
            {status.timestamp && (
              <div className="d-flex justify-content-between">
                <span className="text-muted">Last checked</span>
                <span className="text-muted small">
                  {new Date(status.timestamp).toLocaleTimeString()}
                </span>
              </div>
            )}
          </div>
        )}
      </Card.Body>
      <Card.Footer className="bg-white border-0 pt-0">
        <button 
          className="btn btn-sm btn-outline-secondary w-100"
          onClick={fetchStatus}
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Refreshing...
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt me-2"></i>
              Refresh Status
            </>
          )}
        </button>
      </Card.Footer>
    </Card>
  );
};

export default SystemStatus;
