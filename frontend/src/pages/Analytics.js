import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner, Tabs, Tab } from 'react-bootstrap';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getAnalyticsSummary } from '../services/api';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Sample data - replace with actual data from your API
  const beerTypeData = [
    { name: 'Ale', value: 68 },
    { name: 'Lager', value: 20 },
    { name: 'IPA', value: 45 },
    { name: 'Stout', value: 25 },
    { name: 'Pilsner', value: 15 },
    { name: 'Other', value: 12 }
  ];

  const abvData = [
    { name: '0-3%', value: 15 },
    { name: '3-5%', value: 35 },
    { name: '5-7%', value: 30 },
    { name: '7-9%', value: 15 },
    { name: '9%+', value: 5 }
  ];

  const monthlyTrends = [
    { month: 'Jan', beers: 65 },
    { month: 'Feb', beers: 59 },
    { month: 'Mar', beers: 80 },
    { month: 'Apr', beers: 81 },
    { month: 'May', beers: 56 },
    { month: 'Jun', beers: 55 },
    { month: 'Jul', beers: 40 }
  ];

  const COLORS = ['#FFC107', '#FFA000', '#FF8F00', '#FF6F00', '#FF5722', '#E65100'];
  const ABV_COLORS = ['#4CAF50', '#8BC34A', '#FFC107', '#FF9800', '#F44336'];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch data from our Python Flask API
        const response = await getAnalyticsSummary();
        setAnalytics(response.data);
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
          <p className="mt-3">Loading analytics data...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Analytics</Alert.Heading>
          <p>Failed to connect to Python Flask API: {error}</p>
          <p><strong>Expected API:</strong> http://localhost:5000/api/analytics</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-brewery">Beer Analytics Dashboard</h2>
      
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
        variant="pills"
      >
        <Tab eventKey="overview" title="Overview">
          <Row className="mt-3">
            <Col lg={6} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5>Beer Types Distribution</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={beerTypeData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {beerTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value} beers`, 'Count']} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6} className="mb-4">
              <Card className="h-100">
                <Card.Header className="bg-white">
                  <h5>ABV Distribution</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={abvData}
                        margin={{
                          top: 20, right: 30, left: 20, bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                        <Legend />
                        <Bar dataKey="value" name="Beers">
                          {abvData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={ABV_COLORS[index % ABV_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="trends" title="Trends">
          <Row className="mt-3">
            <Col lg={12} className="mb-4">
              <Card>
                <Card.Header className="bg-white">
                  <h5>Monthly Beer Additions</h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={monthlyTrends}
                        margin={{
                          top: 5, right: 30, left: 20, bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="beers" 
                          name="Beers Added" 
                          stroke="#FFC107" 
                          activeDot={{ r: 8 }} 
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="raw" title="Raw Data">
          <Row className="mt-3">
            <Col>
              <Card>
                <Card.Header>Analytics Data</Card.Header>
                <Card.Body>
                  {analytics ? (
                    <pre className="p-3 bg-light rounded" style={{ maxHeight: '500px', overflow: 'auto' }}>
                      {JSON.stringify(analytics, null, 2)}
                    </pre>
                  ) : (
                    <Alert variant="info">No analytics data available</Alert>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </Container>
  );
};

export default Analytics;
