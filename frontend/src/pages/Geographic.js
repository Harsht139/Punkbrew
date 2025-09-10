import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Form, 
  Button, 
  Alert, 
  Badge, 
  Spinner, 
  Table, 
  ListGroup 
} from 'react-bootstrap';
import { searchGeographic } from '../services/api';

function Geographic() {
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    country: 'US',
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
    setResults([]);
    
    try {
      const startTime = Date.now();
      const response = await searchGeographic(filters);
      
      // response.data should now be the breweries array
      const breweries = Array.isArray(response.data) ? response.data : [];
      
      setResults(breweries);
      setSearchStats({
        method: 'Geographic Search',
        description: 'Search by location and brewery type',
        responseTime: Date.now() - startTime,
        backend: 'Python Service',
        count: breweries.length
      });
      
      if (breweries.length === 0) {
        setError('No breweries found matching your criteria. Try expanding your search.');
      } else {
        setError(''); // Clear any previous error if we have results
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to fetch breweries. Please check your connection and try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSearch = (location) => {
    setFilters({
      ...filters,
      city: location.city,
      state: location.state,
      country: 'US'
    });
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4>Location Search</h4>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSearch}>
                <Form.Group className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., San Diego"
                    value={filters.city}
                    onChange={(e) => setFilters({...filters, city: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>State/Province</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., California"
                    value={filters.state}
                    onChange={(e) => setFilters({...filters, state: e.target.value})}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    as="select"
                    value={filters.country}
                    onChange={(e) => setFilters({...filters, country: e.target.value})}
                  >
                    <option value="US">United States</option>
                    <option value="GB">United Kingdom</option>
                    <option value="DE">Germany</option>
                    <option value="BE">Belgium</option>
                    <option value="CA">Canada</option>
                    <option value="">Other</option>
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Brewery Type</Form.Label>
                  <Form.Control
                    as="select"
                    value={filters.brewery_type}
                    onChange={(e) => setFilters({...filters, brewery_type: e.target.value})}
                  >
                    {breweryTypes.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    'Search Locations'
                  )}
                </Button>
              </Form>

              <div className="mt-4">
                <h5>Popular Locations</h5>
                <ListGroup>
                  {popularLocations.map((loc, index) => (
                    <ListGroup.Item 
                      key={index} 
                      action 
                      onClick={() => handleQuickSearch(loc)}
                    >
                      {loc.city}, {loc.state}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {loading && (
            <div className="text-center my-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
              <p className="mt-2">Searching breweries...</p>
            </div>
          )}

          {searchStats && (
            <Alert variant="info" className="mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{searchStats.method}</strong>
                  <br />
                  <small>{searchStats.description}</small>
                </div>
                <div>
                  <Badge bg="success">{searchStats.responseTime}ms</Badge>
                </div>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  {searchStats.count} results found • {searchStats.backend}
                </small>
              </div>
            </Alert>
          )}

          {!loading && results && results.length > 0 && (
            <div className="search-results">
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Location</th>
                    <th>Website</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((brewery) => (
                    <tr key={brewery.id}>
                      <td>{brewery.name}</td>
                      <td>
                        <Badge bg="secondary">
                          {brewery.brewery_type || 'N/A'}
                        </Badge>
                      </td>
                      <td>
                        {brewery.city}, {brewery.state || brewery.state_province} {brewery.country}
                      </td>
                      <td>
                        {brewery.website_url ? (
                          <a 
                            href={brewery.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary"
                          >
                            Visit
                          </a>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}

          {!loading && results && results.length === 0 && (
            <Alert variant="info">
              No breweries found matching your criteria. Try adjusting your filters.
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default Geographic;
