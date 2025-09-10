import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Spinner, Alert, Button, ButtonGroup } from 'react-bootstrap';
import { getAnalyticsData } from '../../services/api';

// Import sub-components
import SummaryCards from './sections/SummaryCards';
import GeographicAnalysis from './sections/GeographicAnalysis';
import BreweryAnalytics from './sections/BreweryAnalytics';
import BeerAnalysis from './sections/BeerAnalysis';
import MarketTrends from './sections/MarketTrends';
import ConsumerInsights from './sections/ConsumerInsights';

const EnhancedAnalytics = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('year');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Uncomment when API is ready
        // const response = await getAnalyticsData(timeRange);
        // setData(response.data);
        
        // For now, set loading to false after a delay
        setTimeout(() => setIsLoading(false), 1000);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError('Failed to load analytics data. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);

  if (isLoading) {
    return (
      <Container fluid className="px-4 py-3">
        <div className="mb-4 ps-3">
          <h2>Analytics Dashboard</h2>
          <div className="d-flex gap-2 mt-3">
            <ButtonGroup>
              <Button 
                variant={timeRange === '7d' ? 'primary' : 'outline-secondary'}
                onClick={() => setTimeRange('7d')}
                size="sm"
              >
                7D
              </Button>
              <Button 
                variant={timeRange === '30d' ? 'primary' : 'outline-secondary'}
                onClick={() => setTimeRange('30d')}
                size="sm"
              >
                30D
              </Button>
              <Button 
                variant={timeRange === '90d' ? 'primary' : 'outline-secondary'}
                onClick={() => setTimeRange('90d')}
                size="sm"
              >
                90D
              </Button>
              <Button 
                variant={timeRange === 'all' ? 'primary' : 'outline-secondary'}
                onClick={() => setTimeRange('all')}
                size="sm"
              >
                All Time
              </Button>
            </ButtonGroup>
            <Button variant="outline-secondary" size="sm">
              <i className="fas fa-download me-1"></i> Export
            </Button>
          </div>
        </div>
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3">Loading analytics dashboard...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        <Alert.Heading>Error Loading Data</Alert.Heading>
        <p>{error}</p>
      </Alert>
    );
  }

  return (
    <Container fluid className="px-4 py-3">
      <div className="mb-4 ps-3">
        <h2>Analytics Dashboard</h2>
        <div className="d-flex gap-2 mt-3">
          <ButtonGroup>
            <Button 
              variant={timeRange === '7d' ? 'primary' : 'outline-secondary'}
              onClick={() => setTimeRange('7d')}
              size="sm"
            >
              7D
            </Button>
            <Button 
              variant={timeRange === '30d' ? 'primary' : 'outline-secondary'}
              onClick={() => setTimeRange('30d')}
              size="sm"
            >
              30D
            </Button>
            <Button 
              variant={timeRange === '90d' ? 'primary' : 'outline-secondary'}
              onClick={() => setTimeRange('90d')}
              size="sm"
            >
              90D
            </Button>
            <Button 
              variant={timeRange === 'all' ? 'primary' : 'outline-secondary'}
              onClick={() => setTimeRange('all')}
              size="sm"
            >
              All Time
            </Button>
          </ButtonGroup>
          <Button variant="outline-secondary" size="sm">
            <i className="fas fa-download me-1"></i> Export
          </Button>
        </div>
      </div>
      {/* Main Tabs */}
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        variant="pills"
      >
        <Tab eventKey="overview" title="Overview">
          <SummaryCards timeRange={timeRange} onTimeRangeChange={setTimeRange} />
          <GeographicAnalysis />
        </Tab>
        
        <Tab eventKey="breweries" title="Breweries">
          <BreweryAnalytics />
        </Tab>
        
        <Tab eventKey="beers" title="Beers">
          <BeerAnalysis />
        </Tab>
        
        <Tab eventKey="market" title="Market Trends">
          <MarketTrends />
        </Tab>
        
        <Tab eventKey="consumers" title="Consumer Insights">
          <ConsumerInsights />
        </Tab>
      </Tabs>
    </Container>
  );
};

export default EnhancedAnalytics;
