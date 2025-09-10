import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';

const LookerDashboard = () => {
  const [lookerConfig, setLookerConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(0);

  useEffect(() => {
    const fetchLookerConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch Looker configuration from Python Flask API
        const response = await fetch('http://localhost:5000/api/looker/config');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setLookerConfig(data);
      } catch (err) {
        setError(err.message);
        console.error('Looker config fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLookerConfig();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3">Loading Looker Studio configuration...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="warning">
          <Alert.Heading>Looker Studio Configuration</Alert.Heading>
          <p>Unable to load Looker Studio configuration: {error}</p>
          <p>This is expected if you haven't set up Looker Studio dashboards yet.</p>
          <hr />
          <div className="d-flex justify-content-between">
            <Button variant="outline-warning" onClick={() => window.location.reload()}>
              Retry
            </Button>
            <Button variant="warning" href="https://datastudio.google.com" target="_blank">
              Create Looker Dashboard
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="text-brewery">
            <i className="fas fa-external-link-alt me-2"></i>
            Looker Studio Dashboard
          </h1>
          <p className="text-muted">
            Professional dashboards with advanced visualizations and sharing capabilities
          </p>
        </Col>
      </Row>

      {/* Dashboard Selection */}
      {lookerConfig?.available_reports && lookerConfig.available_reports.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="card-brewery">
              <Card.Header className="card-header-brewery">
                <h5 className="mb-0">Available Dashboards</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  {lookerConfig.available_reports.map((report, index) => (
                    <Col md={4} key={index} className="mb-3">
                      <Card 
                        className={`h-100 ${selectedReport === index ? 'border-warning' : ''}`}
                        style={{cursor: 'pointer'}}
                        onClick={() => setSelectedReport(index)}
                      >
                        <Card.Body>
                          <h6 className="text-brewery">{report.name}</h6>
                          <p className="text-muted small">{report.description}</p>
                          <Button 
                            size="sm" 
                            variant={selectedReport === index ? 'warning' : 'outline-warning'}
                            href={report.url}
                            target="_blank"
                          >
                            Open Dashboard
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Embedded Dashboard */}
      <Row>
        <Col>
          <Card className="card-brewery">
            <Card.Header className="card-header-brewery d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                {lookerConfig?.available_reports?.[selectedReport]?.name || 'Brewery Analytics Dashboard'}
              </h5>
              <div>
                <Button 
                  variant="outline-light" 
                  size="sm"
                  href={lookerConfig?.available_reports?.[selectedReport]?.url || lookerConfig?.dashboard_url}
                  target="_blank"
                  className="me-2"
                >
                  <i className="fas fa-external-link-alt me-1"></i>
                  Open in New Tab
                </Button>
                <Button 
                  variant="outline-light" 
                  size="sm"
                  onClick={() => window.location.reload()}
                >
                  <i className="fas fa-sync me-1"></i>
                  Refresh
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="looker-embed">
                {lookerConfig?.dashboard_url ? (
                  <iframe
                    src={lookerConfig.available_reports?.[selectedReport]?.url || lookerConfig.dashboard_url}
                    width="100%"
                    height="600"
                    frameBorder="0"
                    allowFullScreen
                    title="Looker Studio Dashboard"
                  />
                ) : (
                  <div className="text-center p-5">
                    <i className="fas fa-chart-pie fa-4x text-muted mb-3"></i>
                    <h4 className="text-muted">Looker Studio Dashboard</h4>
                    <p className="text-muted">
                      Configure your Looker Studio dashboard URL in the API configuration
                    </p>
                    <Button variant="warning" href="https://datastudio.google.com" target="_blank">
                      Create Dashboard in Looker Studio
                    </Button>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Instructions */}
      <Row className="mt-4">
        <Col>
          <Card className="card-brewery">
            <Card.Header className="card-header-brewery">
              <h5 className="mb-0">
                <i className="fas fa-info-circle me-2"></i>
                Setup Instructions
              </h5>
            </Card.Header>
            <Card.Body>
              <h6 className="text-brewery">To set up Looker Studio dashboards:</h6>
              <ol>
                <li>Go to <a href="https://datastudio.google.com" target="_blank" rel="noopener noreferrer">Looker Studio</a></li>
                <li>Connect to your BigQuery dataset: <code>punkbrew.punkbrew_warehouse</code></li>
                <li>Use the SQL queries from <code>dashboard_queries.sql</code></li>
                <li>Create visualizations for brewery analytics</li>
                <li>Get the embed URL and update the API configuration</li>
              </ol>
              
              <div className="mt-3">
                <Button variant="outline-brewery" className="me-2">
                  <i className="fas fa-download me-1"></i>
                  Download SQL Queries
                </Button>
                <Button variant="brewery" href="https://datastudio.google.com" target="_blank">
                  <i className="fas fa-external-link-alt me-1"></i>
                  Open Looker Studio
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LookerDashboard;
