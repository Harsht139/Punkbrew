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
        // Option 2: Python backend handles all API calls
        data = await fastSearchBreweries(query);
        setSearchStats({
          method: 'Python Backend Only',
          description: 'Fast search using Python requests library',
          responseTime: Date.now() - startTime,
          backend: 'Enhanced Python Service'
        });
      } else {
        // Option 2: Python backend handles API + BigQuery
        data = await searchBreweries(query);
        setSearchStats({
          method: 'Python Backend + BigQuery',
          description: 'Comprehensive search with stored data',
          responseTime: Date.now() - startTime,
          backend: 'Enhanced Python Service'
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
    if (!results) return null;

    // Handle fast search results
    if (results.breweries) {
      return (
        <Card>
          <Card.Header>
            <h5>
              <i className="fas fa-beer"></i> Search Results 
              <Badge bg="primary" className="ms-2">{results.count}</Badge>
            </h5>
          </Card.Header>
          <Card.Body>
            {results.breweries.length === 0 ? (
              <p className="text-muted">No breweries found for "{query}"</p>
            ) : (
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
                    {results.breweries.slice(0, 20).map((brewery) => (
                      <tr key={brewery.id}>
                        <td>
                          <strong>{brewery.name}</strong>
                        </td>
                        <td>
                          <Badge bg="secondary">{brewery.brewery_type}</Badge>
                        </td>
                        <td>
                          <small>
                            {brewery.city}, {brewery.state}
                            <br />
                            <span className="text-muted">{brewery.country}</span>
                          </small>
                        </td>
                        <td>
                          {brewery.website_url && (
                            <a href={brewery.website_url} target="_blank" rel="noopener noreferrer">
                              <i className="fas fa-external-link-alt"></i>
                            </a>
                          )}
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
    }

    // Handle comprehensive search results
    if (results.api_results || results.stored_results) {
      return (
        <>
          <Row>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h6>
                    <i className="fas fa-cloud"></i> Live API Results 
                    <Badge bg="info" className="ms-2">{results.total_api_results}</Badge>
                  </h6>
                </Card.Header>
                <Card.Body>
                  {results.api_results?.slice(0, 5).map((brewery) => (
                    <div key={brewery.id} className="mb-2 p-2 border-bottom">
                      <strong>{brewery.name}</strong>
                      <br />
                      <small className="text-muted">
                        {brewery.city}, {brewery.state} • {brewery.brewery_type}
                      </small>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card>
                <Card.Header>
                  <h6>
                    <i className="fas fa-database"></i> Stored Results 
                    <Badge bg="warning" className="ms-2">{results.total_stored_results}</Badge>
                  </h6>
                </Card.Header>
                <Card.Body>
                  {results.stored_results?.slice(0, 5).map((brewery, idx) => (
                    <div key={idx} className="mb-2 p-2 border-bottom">
                      <strong>{brewery.brewery_name}</strong>
                      <br />
                      <small className="text-muted">
                        ABV: {brewery.abv}% • IBU: {brewery.ibu} • {brewery.type}
                      </small>
                    </div>
                  ))}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      );
    }

    return null;
  };

  return (
    <Container className="mt-4">
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <h4>
                <i className="fas fa-search"></i> Enhanced Brewery Search
                <Badge bg="success" className="ms-2">Option 2: Python Backend</Badge>
              </h4>
            </Card.Header>
            <Card.Body>
              <Alert variant="success">
                <strong>🎯 Option 2 Implementation:</strong> All external API calls are handled by the Python Flask backend using the <code>requests</code> library. 
                The React frontend only communicates with our backend via <code>fetch()</code>.
              </Alert>
              
              <Form onSubmit={handleSearch}>
                <Row className="mb-3">
                  <Col md={8}>
                    <Form.Control
                      type="text"
                      placeholder="Search breweries (e.g., 'stone', 'IPA', 'california')..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      disabled={loading}
                    />
                  </Col>
                  <Col md={4}>
                    <div className="d-flex gap-2">
                      <Form.Select
                        value={searchMode}
                        onChange={(e) => setSearchMode(e.target.value)}
                        disabled={loading}
                      >
                        <option value="fast">Fast Search</option>
                        <option value="comprehensive">Comprehensive</option>
                      </Form.Select>
                      <Button type="submit" disabled={loading || !query.trim()}>
                        {loading ? (
                          <><Spinner size="sm" className="me-1" /> Searching...</>
                        ) : (
                          <><i className="fas fa-search"></i> Search</>
                        )}
                      </Button>
                    </div>
                  </Col>
                </Row>
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

export default Search;
