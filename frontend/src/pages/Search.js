import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Badge, Spinner, Table } from 'react-bootstrap';
import { searchBreweries, fastSearchBreweries, getAutocomplete } from '../services/api';

function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState('fast'); // 'fast' or 'comprehensive'
  const [searchStats, setSearchStats] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults(null);
    
    try {
      const startTime = Date.now();
      let data;
      
      if (searchMode === 'fast') {
        // Fast search using Python backend
        const response = await fastSearchBreweries(query);
        data = response.breweries || [];
        setSearchStats({
          method: 'Python Backend Only',
          description: 'Fast search using Python requests library',
          responseTime: Date.now() - startTime,
          backend: 'Enhanced Python Service',
          count: response.count || 0,
          searchMethod: response.search_method
        });
      } else {
        // Comprehensive search with BigQuery
        const response = await searchBreweries(query);
        data = response.breweries || [];
        setSearchStats({
          method: 'Python Backend + BigQuery',
          description: 'Comprehensive search with stored data',
          responseTime: Date.now() - startTime,
          backend: 'Enhanced Python Service',
          count: response.count || 0,
          searchMethod: response.search_method
        });
      }
      
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderSearchStats = () => {
    if (!searchStats) return null;
    
    return (
      <Alert variant="info" className="mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <strong>🚀 {searchStats.method}</strong>
            <br />
            <small>{searchStats.description}</small>
          </div>
          <div className="text-end">
            <Badge bg="success">{searchStats.responseTime}ms</Badge>
            <br />
            <small className="text-muted">{searchStats.backend}</small>
          </div>
        </div>
      </Alert>
    );
  };

  const renderResults = () => {
    if (!results || results.length === 0) {
      return (
        <Alert variant="info" className="mt-3">
          No results found for "{query}". Try a different search term.
        </Alert>
      );
    }

    return (
      <Card className="mt-3">
        <Card.Header>
          <h5>
            <i className="fas fa-beer"></i> Search Results 
            <Badge bg="primary" className="ms-2">{results.length}</Badge>
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Website</th>
                </tr>
              </thead>
              <tbody>
                {results.map((brewery, index) => (
                  <tr key={brewery.id || index}>
                    <td>
                      <strong>{brewery.name || 'N/A'}</strong>
                    </td>
                    <td>
                      <Badge bg="secondary">
                        {brewery.brewery_type || 'N/A'}
                      </Badge>
                    </td>
                    <td>
                      <small>
                        {brewery.city || 'N/A'}, {brewery.state || 'N/A'}
                        <br />
                        <span className="text-muted">
                          {brewery.country || 'N/A'}
                        </span>
                      </small>
                    </td>
                    <td>
                      {brewery.website_url ? (
                        <a 
                          href={brewery.website_url.startsWith('http') ? brewery.website_url : `https://${brewery.website_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <i className="fas fa-external-link-alt"></i>
                        </a>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    );
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <h2>Brewery Search</h2>
          
          <Form onSubmit={handleSearch} className="mb-4">
            <Row className="g-2">
              <Col md={9}>
                <Form.Control
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search breweries by name, city, or type..."
                  disabled={loading}
                />
              </Col>
              <Col md={3} className="d-flex">
                <Button variant="primary" type="submit" disabled={loading} className="me-2 flex-grow-1">
                  {loading ? <Spinner animation="border" size="sm" /> : 'Search'}
                </Button>
                <Form.Select 
                  value={searchMode}
                  onChange={(e) => setSearchMode(e.target.value)}
                  disabled={loading}
                  style={{ width: 'auto' }}
                >
                  <option value="fast">Fast</option>
                  <option value="comprehensive">Comprehensive</option>
                </Form.Select>
              </Col>
            </Row>
          </Form>

          {error && <Alert variant="danger">{error}</Alert>}
          
          {renderResults()}
        </Col>
      </Row>
    </Container>
  );
}

export default Search;
