import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from our Python Flask API
        const response = await fetch('http://localhost:5000/api/analytics');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        setError(err.message);
        console.error('Analytics fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3">Loading analytics from Python Flask API...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>API Connection Error</Alert.Heading>
          <p>Failed to connect to Python Flask API: {error}</p>
          <p><strong>Expected API:</strong> http://localhost:5000/api/analytics</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h1 className="text-brewery">
            <i className="fas fa-chart-bar me-2"></i>
            Custom React Analytics
          </h1>
          <p className="text-muted">
            Real-time data from Python Flask API + BigQuery
          </p>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="card-brewery">
            <Card.Body className="text-center">
              <h2 className="metric-value text-brewery">
                {analytics?.metadata?.total_breweries?.toLocaleString() || '0'}
              </h2>
              <p className="metric-label">Total Breweries</p>
              <small className="text-muted">From BigQuery</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="card-brewery">
            <Card.Body className="text-center">
              <h2 className="metric-value text-brewery">
                {analytics?.metadata?.countries_covered || '0'}
              </h2>
              <p className="metric-label">Countries</p>
              <small className="text-muted">Geographic Coverage</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="card-brewery">
            <Card.Body className="text-center">
              <h2 className="metric-value text-brewery">
                {analytics?.metadata?.korean_breweries || '0'}
              </h2>
              <p className="metric-label">Korean Breweries</p>
              <small className="text-muted">Market Focus</small>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3} className="mb-3">
          <Card className="card-brewery">
            <Card.Body className="text-center">
              <h2 className="metric-value text-brewery" style={{fontSize: '1.5rem'}}>
                {new Date(analytics?.metadata?.last_updated || Date.now()).toLocaleTimeString()}
              </h2>
              <p className="metric-label">Last Updated</p>
              <small className="text-muted">Real-time</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Tables */}
      <Row>
        <Col lg={6} className="mb-4">
          <Card className="card-brewery">
            <Card.Header className="card-header-brewery">
              <h5 className="mb-0">Geographic Distribution</h5>
            </Card.Header>
            <Card.Body>
              {analytics?.charts?.geographic?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Country</th>
                        <th className="text-end">Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.charts.geographic.map((item, index) => (
                        <tr key={index}>
                          <td>{item.country}</td>
                          <td className="text-end">{item.count?.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No geographic data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="card-brewery">
            <Card.Header className="card-header-brewery">
              <h5 className="mb-0">Brewery Types</h5>
            </Card.Header>
            <Card.Body>
              {analytics?.charts?.breweryTypes?.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th className="text-end">Count</th>
                        <th className="text-end">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.charts.breweryTypes.slice(0, 8).map((item, index) => (
                        <tr key={index}>
                          <td>{item.type}</td>
                          <td className="text-end">{item.count?.toLocaleString()}</td>
                          <td className="text-end">{item.percentage}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted">No brewery type data available</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Raw API Response (for debugging) */}
      <Row>
        <Col>
          <Card className="card-brewery">
            <Card.Header className="card-header-brewery">
              <h5 className="mb-0">
                <i className="fas fa-code me-2"></i>
                API Response (Python Flask → React)
              </h5>
            </Card.Header>
            <Card.Body>
              <pre className="bg-light p-3" style={{fontSize: '0.8rem', maxHeight: '300px', overflow: 'auto'}}>
                {JSON.stringify(analytics, null, 2)}
              </pre>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Analytics;
