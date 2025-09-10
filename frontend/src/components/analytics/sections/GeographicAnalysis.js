import React from 'react';
import { Row, Col, Card, Table } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { FiMapPin, FiGlobe, FiTrendingUp } from 'react-icons/fi';

const GeographicAnalysis = () => {
  // Sample data - replace with API data
  const regionData = [
    { name: 'North America', breweries: 3785, percentage: 45, trend: 12 },
    { name: 'Europe', breweries: 3120, percentage: 38, trend: 8 },
    { name: 'Asia', breweries: 673, percentage: 8, trend: 25 },
    { name: 'Oceania', breweries: 420, percentage: 5, trend: 15 },
    { name: 'South America', breweries: 250, percentage: 3, trend: 10 },
    { name: 'Africa', breweries: 85, percentage: 1, trend: 30 },
  ];

  const countryData = [
    { name: 'United States', breweries: 3650, cities: 1250 },
    { name: 'United Kingdom', breweries: 1850, cities: 420 },
    { name: 'Germany', breweries: 1520, cities: 380 },
    { name: 'Canada', breweries: 1120, cities: 310 },
    { name: 'Australia', breweries: 980, cities: 280 },
  ];

  const COLORS = ['#FFC107', '#FFA000', '#FF8F00', '#FF6F00', '#FF5722', '#E65100'];

  return (
    <Row className="mb-4">
      <Col xl={8} lg={12} className="mb-4">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Header className="bg-white border-0">
            <h5 className="mb-0">
              <FiGlobe className="me-2 text-primary" />
              Geographic Distribution
            </h5>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={regionData}
                  margin={{
                    top: 20, right: 30, left: 20, bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => {
                      if (name === 'breweries') return [value, 'Number of Breweries'];
                      if (name === 'trend') return [`${value}%`, 'Growth'];
                      return [value, 'Percentage'];
                    }}
                  />
                  <Legend />
                  <Bar dataKey="breweries" name="Number of Breweries" fill="#FFC107" />
                  <Bar dataKey="trend" name="Growth %" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xl={4} lg={6} className="mb-4">
        <Card className="h-100 border-0 shadow-sm">
          <Card.Header className="bg-white border-0">
            <h5 className="mb-0">
              <FiMapPin className="me-2 text-primary" />
              By Region
            </h5>
          </Card.Header>
          <Card.Body>
            <div style={{ height: '300px' }} className="mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {regionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4">
              <h6>Top Countries by Brewery Count</h6>
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th className="text-end">Breweries</th>
                    <th className="text-end">Cities</th>
                  </tr>
                </thead>
                <tbody>
                  {countryData.map((country, idx) => (
                    <tr key={idx}>
                      <td>{country.name}</td>
                      <td className="text-end">{country.breweries.toLocaleString()}</td>
                      <td className="text-end">{country.cities.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </Col>
      
      <Col xl={12} className="mb-4">
        <Card className="border-0 shadow-sm">
          <Card.Header className="bg-white border-0">
            <h5 className="mb-0">
              <FiTrendingUp className="me-2 text-primary" />
              Regional Growth Trends
            </h5>
          </Card.Header>
          <Card.Body>
            <p className="text-muted">
              The craft beer industry is experiencing significant growth in emerging markets, 
              particularly in Asia and Africa, while traditional markets show steady growth.
            </p>
            <div className="row g-4">
              {regionData.map((region, idx) => (
                <div key={idx} className="col-md-4 col-6">
                  <div className="p-3 bg-light rounded">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="mb-0">{region.name}</h6>
                      <span className={`badge bg-${region.trend >= 10 ? 'success' : 'warning'} bg-opacity-10 text-${region.trend >= 10 ? 'success' : 'warning'}`}>
                        {region.trend}% <FiTrendingUp className="ms-1" />
                      </span>
                    </div>
                    <div className="progress" style={{ height: '8px' }}>
                      <div 
                        className={`progress-bar bg-${region.trend >= 10 ? 'success' : 'warning'}`} 
                        role="progressbar" 
                        style={{ width: `${region.percentage}%` }}
                        aria-valuenow={region.percentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-muted">{region.breweries.toLocaleString()} breweries</small>
                      <small className="text-muted">{region.percentage}%</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default GeographicAnalysis;
