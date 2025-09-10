import React, { useState, useEffect } from 'react';
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
  ListGroup,
  Tabs,
  Tab
} from 'react-bootstrap';
import { 
  searchBreweries, 
  fastSearchBreweries, 
  searchGeographic 
} from '../services/api';

function UnifiedSearch() {
  // Search state
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'location'
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchStats, setSearchStats] = useState(null);
  
  // Text search state
  const [searchMode, setSearchMode] = useState('fast'); // 'fast' or 'comprehensive'
  const [textResults, setTextResults] = useState(null);
  
  // Location search state
  const [filters, setFilters] = useState({
    city: '',
    state: '',
    country: 'US',
    brewery_type: ''
  });
  const [locationResults, setLocationResults] = useState(null);

  // Shared data
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

  // Text search handler
  const handleTextSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setTextResults(null);
    
    try {
      const startTime = Date.now();
      let response;
      
      if (searchMode === 'fast') {
        response = await fastSearchBreweries(query);
      } else {
        response = await searchBreweries(query);
      }
      
      setTextResults(response.data || []);
      setSearchStats({
        method: searchMode === 'fast' ? 'Fast Search' : 'Comprehensive Search',
        description: searchMode === 'fast' 
          ? 'Quick search using in-memory index' 
          : 'Detailed search with BigQuery',
        responseTime: Date.now() - startTime,
        backend: 'Python Service',
        count: response.data?.length || 0
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to perform search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Location search handler
  const handleLocationSearch = async (e) => {
    e && e.preventDefault();
    if (!filters.city && !filters.state && !filters.brewery_type) {
      setError('Please specify at least one filter (city, state, or brewery type)');
      return;
    }

    setLoading(true);
    setError('');
    setLocationResults(null);
    
    try {
      const startTime = Date.now();
      const response = await searchGeographic(filters);
      
      setLocationResults(response.data || []);
      setSearchStats({
        method: 'Location Search',
        description: 'Search by location and brewery type',
        responseTime: Date.now() - startTime,
        backend: 'Python Service',
        count: response.data?.length || 0
      });
    } catch (err) {
      console.error('Location search error:', err);
      setError('Failed to fetch breweries. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Quick location search handler
  const handleQuickSearch = (location) => {
    setFilters({
      ...filters,
      city: location.city,
      state: location.state,
      country: 'US'
    }, () => {
      // Search immediately after setting the filters
      handleLocationSearch();
    });
  };

  // Render search results
  const renderResults = (results) => {
    if (!results) return null;
    if (results.length === 0) {
      return <Alert variant="info">No results found. Try adjusting your search criteria.</Alert>;
    }

    return (
      <Table striped bordered hover responsive className="mt-3">
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
    );
  };

  // Render search stats
  const renderSearchStats = () => {
    if (!searchStats) return null;
    
    return (
      <Alert variant="info" className="mt-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>{searchStats.method}</strong>
            <br />
            <small>{searchStats.description}</small>
          </div>
          <div>
            <Badge bg="success">{searchStats.responseTime}ms</Badge>
            <Badge bg="primary" className="ms-2">{searchStats.count} results</Badge>
          </div>
        </div>
      </Alert>
    );
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Brewery Search</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="text" title="Text Search">
          <Card>
            <Card.Body>
              <Form onSubmit={handleTextSearch}>
                <Row className="g-3">
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      placeholder="Search breweries by name, city, or type..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      disabled={loading}
                    />
                  </Col>
                  <Col md={2}>
                    <Form.Select
                      value={searchMode}
                      onChange={(e) => setSearchMode(e.target.value)}
                      disabled={loading}
                    >
                      <option value="fast">Fast</option>
                      <option value="comprehensive">Comprehensive</option>
                    </Form.Select>
                  </Col>
                  <Col md={2}>
                    <Button 
                      variant="primary" 
                      type="submit" 
                      disabled={loading || !query.trim()}
                      className="w-100"
                    >
                      {loading ? <Spinner size="sm" /> : 'Search'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Card.Body>
          </Card>
          
          {renderSearchStats()}
          {renderResults(textResults)}
        </Tab>
        
        <Tab eventKey="location" title="Location Search">
          <Row>
            <Col md={5}>
              <Card>
                <Card.Body>
                  <Form onSubmit={handleLocationSearch}>
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
                      {loading ? <Spinner size="sm" /> : 'Search Locations'}
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
            
            <Col md={7}>
              {renderSearchStats()}
              {renderResults(locationResults)}
            </Col>
          </Row>
        </Tab>
      </Tabs>
      
      {error && <Alert variant="danger">{error}</Alert>}
    </Container>
  );
}

export default UnifiedSearch;
