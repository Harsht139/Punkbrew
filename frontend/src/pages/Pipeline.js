import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Badge, Button, ProgressBar, ListGroup, Table, Spinner } from 'react-bootstrap';
import { healthCheck, getPipelineStatus } from '../services/api';

function Pipeline() {
  const [health, setHealth] = useState(null);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchSystemStatus = async () => {
    try {
      setLoading(true);
      const [healthResponse, pipelineResponse] = await Promise.all([
        healthCheck(),
        getPipelineStatus()
      ]);
      
      // Extract data from API response
      const healthData = healthResponse.data || healthResponse;
      const pipelineData = pipelineResponse.data || pipelineResponse;
      
      setHealth(healthData);
      setPipelineStatus(pipelineData);
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      console.error('Pipeline status error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderHealthStatus = () => {
    if (!health) return null;

    const isHealthy = health.status === 'healthy';
    const apiHealthy = health.external_api_health?.status === 'healthy';
    
    return (
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <h5 className="text-brewery mb-0">
            <i className="fas fa-chart-line me-2"></i>System Overview
          </h5>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="g-4">
            {/* Health Status */}
            <Col md={4}>
              <Card className="h-100 border-0" style={{backgroundColor: 'rgba(25, 135, 84, 0.05)'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className={`fas fa-${isHealthy ? 'check-circle' : 'exclamation-circle'} fa-3x ${isHealthy ? 'text-success' : 'text-danger'}`}></i>
                  </div>
                  <h5>System Status</h5>
                  <Badge bg={isHealthy ? 'success' : 'danger'} className="mb-3">
                    {isHealthy ? 'OPERATIONAL' : 'ISSUE DETECTED'}
                  </Badge>
                  <p className="small text-muted mb-0">
                    <i className="fas fa-server me-1"></i> {health.backend_type}
                  </p>
                </Card.Body>
              </Card>
            </Col>

            {/* Database Status */}
            <Col md={4}>
              <Card className="h-100 border-0" style={{backgroundColor: 'rgba(13, 110, 253, 0.05)'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className={`fas fa-${health.bigquery_connected ? 'database' : 'unlink'} fa-3x ${health.bigquery_connected ? 'text-primary' : 'text-danger'}`}></i>
                  </div>
                  <h5>Database</h5>
                  <Badge bg={health.bigquery_connected ? 'primary' : 'danger'} className="mb-3">
                    {health.bigquery_connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </Badge>
                  <p className="small text-muted mb-0">
                    <i className="fas fa-sync-alt me-1"></i> Last checked: {new Date().toLocaleTimeString()}
                  </p>
                </Card.Body>
              </Card>
            </Col>

            {/* API Status */}
            <Col md={4}>
              <Card className="h-100 border-0" style={{backgroundColor: 'rgba(255, 193, 7, 0.05)'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className={`fas fa-${apiHealthy ? 'plug' : 'plug-circle-xmark'} fa-3x ${apiHealthy ? 'text-warning' : 'text-danger'}`}></i>
                  </div>
                  <h5>External Services</h5>
                  <Badge bg={apiHealthy ? 'warning' : 'danger'} className="mb-3" text={apiHealthy ? 'dark' : 'white'}>
                    {apiHealthy ? 'ONLINE' : 'OFFLINE'}
                  </Badge>
                  <p className="small text-muted mb-0">
                    <i className="fas fa-cloud me-1"></i> API Status
                  </p>
                </Card.Body>
              </Card>
            </Col>

            {/* Cache Stats */}
            {health.cache_stats && (
              <Col md={12}>
                <Card className="border-0 shadow-sm">
                  <Card.Header className="bg-white border-0">
                    <h6 className="mb-0"><i className="fas fa-memory me-2"></i>Cache Performance</h6>
                  </Card.Header>
                  <Card.Body>
                    <Row className="align-items-center">
                      <Col md={3} className="text-center">
                        <div className="display-6 fw-bold">
                          {Math.round((health.cache_stats.valid_entries / Math.max(health.cache_stats.total_entries, 1)) * 100)}%
                        </div>
                        <div className="small text-muted">Cache Hit Rate</div>
                      </Col>
                      <Col md={9}>
                        <div className="d-flex justify-content-between small mb-2">
                          <span>Valid: {health.cache_stats.valid_entries}</span>
                          <span>Expired: {health.cache_stats.expired_entries}</span>
                          <span>TTL: {health.cache_stats.cache_ttl_seconds}s</span>
                        </div>
                        <ProgressBar 
                          now={(health.cache_stats.valid_entries / Math.max(health.cache_stats.total_entries, 1)) * 100}
                          variant="warning"
                          style={{height: '8px'}}
                        />
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderPipelineStatus = () => {
    if (!pipelineStatus) return null;

    return (
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <h5 className="text-brewery mb-0">
            <i className="fas fa-cogs me-2"></i>Pipeline Services
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          {pipelineStatus.components && (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th className="ps-4 py-3">Service</th>
                    <th className="text-center">Status</th>
                    <th className="text-end pe-4">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {pipelineStatus.components.map((component, idx) => (
                    <tr key={idx} className="border-top">
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center">
                          <div className={`me-3 rounded-circle ${component.status === 'active' ? 'bg-success' : 'bg-warning'}`} style={{width: '10px', height: '10px'}}></div>
                          <div>
                            <div className="fw-semibold">{component.name}</div>
                            <div className="small text-muted">{component.details}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge bg={component.status === 'active' ? 'success' : 'warning'} className="px-3 py-1">
                          {component.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="text-end pe-4">
                        <div className="small text-muted">{component.last_updated}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderSystemMetrics = () => {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0">
          <h5 className="text-brewery mb-0">
            <i className="fas fa-chart-pie me-2"></i>System Architecture
          </h5>
        </Card.Header>
        <Card.Body>
          <Row className="g-4">
            <Col md={4}>
              <Card className="h-100 border-0" style={{backgroundColor: 'rgba(111, 66, 193, 0.05)'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-server fa-3x text-primary"></i>
                  </div>
                  <h5>API Layer</h5>
                  <p className="small text-muted mb-0">
                    <i className="fas fa-plug me-1"></i> RESTful endpoints with caching
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0" style={{backgroundColor: 'rgba(25, 135, 84, 0.05)'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-cogs fa-3x text-success"></i>
                  </div>
                  <h5>Processing</h5>
                  <p className="small text-muted mb-0">
                    <i className="fas fa-tasks me-1"></i> Async data transformation
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="h-100 border-0" style={{backgroundColor: 'rgba(13, 110, 253, 0.05)'}}>
                <Card.Body className="text-center p-4">
                  <div className="mb-3">
                    <i className="fas fa-database fa-3x text-info"></i>
                  </div>
                  <h5>Data Storage</h5>
                  <p className="small text-muted mb-0">
                    <i className="fas fa-warehouse me-1"></i> BigQuery data warehouse
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1 className="mb-0 text-brewery">
              <i className="fas fa-tachometer-alt me-2"></i>
              System Dashboard
            </h1>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => window.location.reload()}
            >
              <i className="fas fa-sync-alt me-1"></i> Refresh
            </Button>
          </div>
          <p className="text-muted">Monitor system health and service status</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger" className="mb-4" dismissible onClose={() => setError('')}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {loading && !health ? (
        <Alert variant="info" className="mb-4">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading system status...
        </Alert>
      ) : (
        <>
          {renderHealthStatus()}
          {renderPipelineStatus()}
          {renderSystemMetrics()}
        </>
      )}

      <div className="text-muted small mt-4 text-center">
        <i className="fas fa-circle text-success me-1" style={{fontSize: '8px'}}></i>
        Last updated: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
        <span className="mx-2">•</span>
        Auto-refreshing every 30 seconds
      </div>
    </Container>
  );
}

export default Pipeline;
