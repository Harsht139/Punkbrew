import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Badge, Button, ProgressBar, ListGroup, Table } from 'react-bootstrap';
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
      <Card className="mb-4">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <h5>
              <i className="fas fa-heartbeat"></i> System Health
            </h5>
            <Badge bg={isHealthy ? 'success' : 'danger'}>
              {isHealthy ? 'HEALTHY' : 'UNHEALTHY'}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span><i className="fas fa-server"></i> Backend Status</span>
                  <Badge bg={isHealthy ? 'success' : 'danger'}>
                    {health.backend_type}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span><i className="fas fa-database"></i> BigQuery Connection</span>
                  <Badge bg={health.bigquery_connected ? 'success' : 'danger'}>
                    {health.bigquery_connected ? 'CONNECTED' : 'DISCONNECTED'}
                  </Badge>
                </ListGroup.Item>
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <span><i className="fas fa-cloud"></i> External API</span>
                  <Badge bg={apiHealthy ? 'success' : 'danger'}>
                    {apiHealthy ? 'ACCESSIBLE' : 'UNAVAILABLE'}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={6}>
              {health.cache_stats && (
                <Card>
                  <Card.Header>
                    <h6><i className="fas fa-memory"></i> Cache Statistics</h6>
                  </Card.Header>
                  <Card.Body>
                    <small>
                      <strong>Total Entries:</strong> {health.cache_stats.total_entries}<br />
                      <strong>Valid Entries:</strong> {health.cache_stats.valid_entries}<br />
                      <strong>Expired Entries:</strong> {health.cache_stats.expired_entries}<br />
                      <strong>TTL:</strong> {health.cache_stats.cache_ttl_seconds}s
                    </small>
                    <ProgressBar 
                      className="mt-2"
                      now={(health.cache_stats.valid_entries / Math.max(health.cache_stats.total_entries, 1)) * 100}
                      label={`${Math.round((health.cache_stats.valid_entries / Math.max(health.cache_stats.total_entries, 1)) * 100)}% valid`}
                    />
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const renderPipelineStatus = () => {
    if (!pipelineStatus) return null;

    return (
      <Card className="mb-4">
        <Card.Header>
          <h5><i className="fas fa-cogs"></i> Pipeline Status</h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <strong>🚀 Option 2 Architecture:</strong> All data processing and API calls are handled by the Python Flask backend. 
            The pipeline uses enhanced caching and error handling for optimal performance.
          </Alert>
          
          {pipelineStatus.components && (
            <Table striped hover>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {pipelineStatus.components.map((component, idx) => (
                  <tr key={idx}>
                    <td><strong>{component.name}</strong></td>
                    <td>
                      <Badge bg={component.status === 'active' ? 'success' : 'warning'}>
                        {component.status}
                      </Badge>
                    </td>
                    <td><small>{component.last_updated}</small></td>
                    <td><small>{component.details}</small></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    );
  };

  const renderSystemMetrics = () => {
    return (
      <Card>
        <Card.Header>
          <h5><i className="fas fa-chart-line"></i> System Metrics</h5>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-success">
                    <i className="fas fa-check-circle"></i>
                  </h3>
                  <h5>Option 2</h5>
                  <small className="text-muted">Python Backend Architecture</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-primary">
                    <i className="fas fa-server"></i>
                  </h3>
                  <h5>Flask API</h5>
                  <small className="text-muted">Enhanced with Caching</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <h3 className="text-warning">
                    <i className="fas fa-database"></i>
                  </h3>
                  <h5>BigQuery</h5>
                  <small className="text-muted">Data Warehouse</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {lastUpdate && (
            <Alert variant="light" className="mt-3 mb-0">
              <small>
                <i className="fas fa-clock"></i> Last updated: {lastUpdate.toLocaleTimeString()}
                <span className="ms-3">
                  <i className="fas fa-sync-alt"></i> Auto-refresh: 30s
                </span>
              </small>
            </Alert>
          )}
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4>
              <i className="fas fa-cogs"></i> Pipeline Management
              <Badge bg="success" className="ms-2">Option 2: Python Backend</Badge>
            </h4>
            <Button 
              variant="outline-primary" 
              onClick={fetchSystemStatus}
              disabled={loading}
            >
              <i className="fas fa-sync-alt"></i> Refresh
            </Button>
          </div>

          {error && (
            <Alert variant="danger">
              <i className="fas fa-exclamation-triangle"></i> {error}
            </Alert>
          )}

          {loading && !health ? (
            <Alert variant="info">
              <i className="fas fa-spinner fa-spin"></i> Loading system status...
            </Alert>
          ) : (
            <>
              {renderHealthStatus()}
              {renderPipelineStatus()}
              {renderSystemMetrics()}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Pipeline;
