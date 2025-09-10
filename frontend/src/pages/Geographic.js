import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner, Table, ListGroup } from 'react-bootstrap';
import { searchGeographic } from '../services/api';

function Geographic() {
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    country: 'United States',
    brewery_type: ''
  });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchStats, setSearchStats] = useState(null);

  const breweryTypes = [
    { value: '', label: 'All Types' },
    { value: 'micro', label: 'Microbrewery' },
    { value: 'brewpub', label: 'Brewpub' },
    { value: 'large', label: 'Large Brewery' },
    { value: 'regional', label: 'Regional' },
    { value: 'contract', label: 'Contract' },
    { value: 'proprietor', label: 'Proprietor' }
  ];

  const popularLocations = [
    { city: 'San Diego', state: 'California' },
    { city: 'Portland', state: 'Oregon' },
    { city: 'Denver', state: 'Colorado' },
    { city: 'Austin', state: 'Texas' },
    { city: 'Seattle', state: 'Washington' },
    { city: 'Asheville', state: 'North Carolina' }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!filters.city && !filters.state && !filters.brewery_type) {
      setError('Please specify at least one filter (city, state, or brewery type)');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      const startTime = Date.now();
      
      // Clean filters (remove empty values)
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value.trim() !== '')
      );
      
      const data = await searchGeographic(cleanFilters);
      
      setSearchStats({
        method: 'Geographic Search',
        description: 'Location-based brewery discovery',
        responseTime: Date.now() - startTime,
        filters: cleanFilters
      });
      
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (location) => {
    setFilters(prev => ({
      ...prev,
      city: location.city,
      state: location.state
    }));
  };

  const renderSearchStats = () => {
    if (!searchStats) return null;
    
    return (
      <Alert variant="info" className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>🌍 {searchStats.method}</strong>
            <br />
            <small>{searchStats.description}</small>
          </div>
          <div className="text-end">
            <Badge bg="success">{searchStats.responseTime}ms</Badge>
            <br />
            <small className="text-muted">Python Backend</small>
          </div>
        </div>
        <div className="mt-2">
          <small><strong>Filters:</strong> {JSON.stringify(searchStats.filters)}</small>
        </div>
      </Alert>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    if (results.breweries && results.breweries.length === 0) {
      return (
        <Alert variant="warning">
          <i className="fas fa-map-marker-alt"></i> No breweries found for the specified location filters.
        </Alert>
      );
    }

    const breweries = results.breweries || [];
    const groupedByType = breweries.reduce((acc, brewery) => {
      const type = brewery.brewery_type || 'unknown';
      if (!acc[type]) acc[type] = [];
      acc[type].push(brewery);
      return acc;
    }, {});

    return (
      <>
        <Card className="mb-4">
          <Card.Header>
            <h5>
              <i className="fas fa-map-marker-alt"></i> Geographic Results 
              <Badge bg="primary" className="ms-2">{breweries.length}</Badge>
            </h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={8}>
                <div className="table-responsive">
                  <Table striped hover size="sm">
                    <thead>
                      <tr>
                        <th>Brewery</th>
                        <th>Type</th>
                        <th>Address</th>
                        <th>Contact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breweries.slice(0, 20).map((brewery) => (
                        <tr key={brewery.id}>
                          <td>
                            <strong>{brewery.name}</strong>
                          </td>
                          <td>
                            <Badge bg="secondary" className="text-capitalize">
                              {brewery.brewery_type}
                            </Badge>
                          </td>
                          <td>
                            <small>
                              {brewery.address_1 && <>{brewery.address_1}<br /></>}
                              {brewery.city}, {brewery.state} {brewery.postal_code}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex gap-1">
                              {brewery.phone && (
                                <Badge bg="info" title="Phone">
                                  <i className="fas fa-phone"></i>
                                </Badge>
                              )}
                              {brewery.website_url && (
                                <a href={brewery.website_url} target="_blank" rel="noopener noreferrer">
                                  <Badge bg="success">
                                    <i className="fas fa-external-link-alt"></i>
                                  </Badge>
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Col>
              <Col md={4}>
                <Card>
                  <Card.Header>
                    <h6><i className="fas fa-chart-pie"></i> Brewery Types</h6>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush">
                      {Object.entries(groupedByType).map(([type, typeBreweries]) => (
                        <ListGroup.Item key={type} className="d-flex justify-content-between align-items-center">
                          <span className="text-capitalize">{type}</span>
                          <Badge bg="primary">{typeBreweries.length}</Badge>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </>
    );
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>
                <i className="fas fa-globe"></i> Geographic Intelligence
                <Badge bg="success" className="ms-2">Option 2: Python Backend</Badge>
              </h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="success">
                <strong>🎯 Location-Based Discovery:</strong> Search breweries by geographic location using our Python backend API service.
              </Alert>
              
              <Form onSubmit={handleSearch}>
                <Row className="mb-3">
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>City</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., San Diego"
                        value={filters.city}
                        onChange={(e) => setFilters(prev => ({ ...prev, city: e.target.value }))}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>State/Province</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="e.g., California"
                        value={filters.state}
                        onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value }))}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Country</Form.Label>
                      <Form.Control
                        type="text"
                        value={filters.country}
                        onChange={(e) => setFilters(prev => ({ ...prev, country: e.target.value }))}
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={3}>
                    <Form.Group>
                      <Form.Label>Brewery Type</Form.Label>
                      <Form.Select
                        value={filters.brewery_type}
                        onChange={(e) => setFilters(prev => ({ ...prev, brewery_type: e.target.value }))}
                        disabled={loading}
                      >
                        {breweryTypes.map(type => (
                          <option key={type.value} value={type.value}>{type.label}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <><Spinner size="sm" className="me-1" /> Searching...</>
                    ) : (
                      <><i className="fas fa-search"></i> Search Location</>
                    )}
                  </Button>
                  
                  <div>
                    <small className="text-muted me-2">Quick searches:</small>
                    {popularLocations.slice(0, 3).map((location, idx) => (
                      <Button
                        key={idx}
                        variant="outline-secondary"
                        size="sm"
                        className="me-1"
                        onClick={() => handleQuickSearch(location)}
                        disabled={loading}
                      >
                        {location.city}
                      </Button>
                    ))}
                  </div>
                </div>
              </Form>

              {error && (
                <Alert variant="danger">
                  <i className="fas fa-exclamation-triangle"></i> {error}
                </Alert>
              )}

              {renderSearchStats()}
              {renderResults()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Geographic;
