import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { getAnalyticsSummary, getSystemStatus, handleApiError } from '../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('📊 Fetching dashboard data...');
        const [summaryResponse, statusResponse] = await Promise.all([
          getAnalyticsSummary(),
          getSystemStatus()
        ]);

        console.log('📦 Received summary data:', summaryResponse.data);
        console.log('🔌 System status:', statusResponse.data);

        setSummary(summaryResponse.data);
        setSystemStatus(statusResponse.data);
      } catch (err) {
        const errorInfo = handleApiError(err);
        setError(errorInfo.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <Container className="mt-5">
        <div className="text-center">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3">Loading dashboard data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Dashboard Error</Alert.Heading>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="text-brewery mb-1">
                <i className="fas fa-beer me-2"></i>
                Beer Recipe Intelligence Dashboard
              </h1>
              <p className="text-muted">
                Comprehensive beer analytics from 8,408 craft beer recipes
              </p>
            </div>
            <div className="text-end">
              {/* Connection status removed as requested */}
            </div>
          </div>
        </Col>
      </Row>

      {/* Key Metrics */}
      <Row className="mb-4 g-4">
        <Col md={3}>
          <Card className="metric-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="position-relative">
                <div className="metric-icon bg-brewery-gold bg-opacity-10 text-brewery-gold rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <i className="fas fa-beer fa-2x"></i>
                </div>
                <h2 className="metric-value text-brewery-dark mb-1">{summary?.total_beers?.toLocaleString() || '0'}</h2>
                <p className="metric-label text-muted mb-0">Total Beer Recipes</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="metric-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="position-relative">
                <div className="metric-icon bg-brewery-gold bg-opacity-10 text-brewery-gold rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <i className="fas fa-layer-group fa-2x"></i>
                </div>
                <h2 className="metric-value text-brewery-dark mb-1">{summary?.beer_categories || '0'}</h2>
                <p className="metric-label text-muted mb-0">Beer Categories</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="metric-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="position-relative">
                <div className="metric-icon bg-brewery-gold bg-opacity-10 text-brewery-gold rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <i className="fas fa-percentage fa-2x"></i>
                </div>
                <h2 className="metric-value text-brewery-dark mb-1">{summary?.avg_abv?.toFixed(1) || '0'}%</h2>
                <p className="metric-label text-muted mb-0">Average ABV</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="metric-card h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="position-relative">
                <div className="metric-icon bg-brewery-gold bg-opacity-10 text-brewery-gold rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '70px', height: '70px'}}>
                  <i className="fas fa-trophy fa-2x"></i>
                </div>
                <h2 className="metric-value text-brewery-dark mb-1">{summary?.top_category || 'Unknown'}</h2>
                <p className="metric-label text-muted mb-0">Top Category</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Beer Category Breakdown */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h4 className="mb-0 d-flex align-items-center">
                <i className="fas fa-chart-pie me-2 text-brewery"></i>
                <span>Category Breakdown</span>
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4">
                {/* Ale Beers */}
                <Col md={4} className="category-col">
                  <div className="category-card h-100 p-4 rounded-3" 
                       style={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 193, 7, 0.02) 100%', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="d-flex align-items-center mb-3">
                      <div className="category-icon me-3">
                        <i className="fas fa-beer fa-2x text-brewery"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Ale Beers</h5>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <h2 className="mb-0 fw-bold text-brewery">{summary?.ale_beers?.toLocaleString() || '6,870'}</h2>
                      <span className="badge fw-bold" style={{
                        padding: '0.5em 0.8em',
                        fontSize: '0.95em',
                        color: '#000',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: 'none'
                      }}>81.7%</span>
                    </div>
                    <div className="progress mt-3" style={{height: '4px', backgroundColor: 'rgba(0,0,0,0.05)'}}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{
                          width: '81.7%', 
                          minWidth: '4px',
                          backgroundColor: '#FFC107'
                        }}
                        aria-valuenow="6870"
                        aria-valuemin="0"
                        aria-valuemax="8408"
                      ></div>
                    </div>
                  </div>
                </Col>

                {/* Lager Beers */}
                <Col md={4} className="category-col">
                  <div className="category-card h-100 p-4 rounded-3" 
                       style={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 193, 7, 0.02) 100%)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="d-flex align-items-center mb-3">
                      <div className="category-icon me-3">
                        <i className="fas fa-beer fa-2x text-brewery"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Lager Beers</h5>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <h2 className="mb-0 fw-bold text-brewery">{summary?.lager_beers?.toLocaleString() || '323'}</h2>
                      <span className="badge fw-bold" style={{
                        padding: '0.5em 0.8em',
                        fontSize: '0.95em',
                        color: '#000',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: 'none'
                      }}>3.8%</span>
                    </div>
                    <div className="progress mt-3" style={{height: '4px', backgroundColor: 'rgba(0,0,0,0.05)'}}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{
                          width: '3.8%', 
                          minWidth: '4px',
                          backgroundColor: '#FFC107'
                        }}
                        aria-valuenow="323"
                        aria-valuemin="0"
                        aria-valuemax="8408"
                      ></div>
                    </div>
                  </div>
                </Col>

                {/* Other Beers */}
                <Col md={4} className="category-col">
                  <div className="category-card h-100 p-4 rounded-3" 
                       style={{ background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.05) 0%, rgba(255, 193, 7, 0.02) 100%)', border: '1px solid rgba(0,0,0,0.05)' }}>
                    <div className="d-flex align-items-center mb-3">
                      <div className="category-icon me-3">
                        <i className="fas fa-beer fa-2x text-brewery"></i>
                      </div>
                      <h5 className="mb-0 fw-semibold">Other Beers</h5>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <h2 className="mb-0 fw-bold text-brewery">{summary?.other_beers?.toLocaleString() || '1,215'}</h2>
                      <span className="badge fw-bold" style={{
                        padding: '0.5em 0.8em',
                        fontSize: '0.95em',
                        color: '#000',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        boxShadow: 'none'
                      }}>14.5%</span>
                    </div>
                    <div className="progress mt-3" style={{height: '4px', backgroundColor: 'rgba(0,0,0,0.05)'}}>
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{
                          width: '14.5%', 
                          minWidth: '4px',
                          backgroundColor: '#FFC107'
                        }}
                        aria-valuenow="1215"
                        aria-valuemin="0"
                        aria-valuemax="8408"
                      ></div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Dashboard Options */}
      <Row className="mb-4">
        <Col>
          <h2 className="text-brewery mb-3">
            <i className="fas fa-chart-bar me-2"></i>
            Analytics Dashboards
          </h2>
          <p className="text-muted mb-4">
            Choose between custom interactive charts or embedded Looker Studio dashboards
          </p>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Custom Analytics Dashboard */}
        <Col lg={6} className="mb-4">
          <Card className="card-brewery h-100">
            <Card.Header className="card-header-brewery">
              <h4 className="mb-0">
                <i className="fas fa-chart-line me-2"></i>
                Custom React Analytics
              </h4>
            </Card.Header>
            <Card.Body>
              <p className="card-text">
                Interactive charts built with React and Chart.js. Real-time data from our Flask API 
                with full customization and control.
              </p>
              
              <div className="mb-3">
                <h6 className="text-brewery">Features:</h6>
                <ul className="list-unstyled">
                  <li><i className="fas fa-check text-success me-2"></i>Real-time data updates</li>
                  <li><i className="fas fa-check text-success me-2"></i>Interactive charts</li>
                  <li><i className="fas fa-check text-success me-2"></i>Custom styling</li>
                  <li><i className="fas fa-check text-success me-2"></i>Mobile responsive</li>
                  <li><i className="fas fa-check text-success me-2"></i>Fast loading</li>
                </ul>
              </div>
              
              <div className="d-grid">
                <Link to="/analytics" className="btn btn-brewery">
                  <i className="fas fa-chart-bar me-2"></i>
                  View Custom Analytics
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Looker Studio Dashboard */}
        <Col lg={6} className="mb-4">
          <Card className="card-brewery h-100">
            <Card.Header className="card-header-brewery">
              <h4 className="mb-0">
                <i className="fas fa-external-link-alt me-2"></i>
                Looker Studio Dashboard
              </h4>
            </Card.Header>
            <Card.Body>
              <p className="card-text">
                Professional dashboards created in Google Looker Studio with advanced 
                visualizations and built-in sharing capabilities.
              </p>
              
              <div className="mb-3">
                <h6 className="text-brewery">Features:</h6>
                <ul className="list-unstyled">
                  <li><i className="fas fa-check text-success me-2"></i>Professional design</li>
                  <li><i className="fas fa-check text-success me-2"></i>Advanced filters</li>
                  <li><i className="fas fa-check text-success me-2"></i>Export capabilities</li>
                  <li><i className="fas fa-check text-success me-2"></i>Collaboration tools</li>
                  <li><i className="fas fa-check text-success me-2"></i>Scheduled reports</li>
                </ul>
              </div>
              
              <div className="d-grid">
                <Link to="/looker" className="btn btn-outline-brewery">
                  <i className="fas fa-external-link-alt me-2"></i>
                  View Looker Dashboard
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col>
          <h3 className="text-brewery mb-3">
            <i className="fas fa-bolt me-2"></i>
            Quick Actions
          </h3>
        </Col>
      </Row>

      <Row>
        <Col md={4} className="mb-3">
          <Card 
            className="card-brewery clickable-card"
            onClick={() => {
              console.log('Search card clicked!');
              navigate('/search');
            }}
            style={{cursor: 'pointer'}}
          >
            <Card.Body className="text-center">
              <i className="fas fa-search fa-3x text-brewery-gold mb-3"></i>
              <h5>Search & Discovery</h5>
              <p className="text-muted">Find breweries with real-time search and discovery engine</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card 
            className="card-brewery clickable-card"
            onClick={() => {
              console.log('Geographic card clicked!');
              navigate('/geographic');
            }}
            style={{cursor: 'pointer'}}
          >
            <Card.Body className="text-center">
              <i className="fas fa-map-marked-alt fa-3x text-brewery-gold mb-3"></i>
              <h5>Geographic Intelligence</h5>
              <p className="text-muted">Explore breweries by location and geographic insights</p>
            </Card.Body>
          </Card>
        </Col>

        <Col md={4} className="mb-3">
          <Card 
            className="card-brewery clickable-card"
            onClick={() => {
              console.log('Pipeline card clicked!');
              navigate('/pipeline');
            }}
            style={{cursor: 'pointer'}}
          >
            <Card.Body className="text-center">
              <i className="fas fa-cogs fa-3x text-brewery-gold mb-3"></i>
              <h5>Pipeline Management</h5>
              <p className="text-muted">Monitor and manage the data pipeline and system health</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
