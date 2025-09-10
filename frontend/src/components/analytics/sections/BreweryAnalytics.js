import React from 'react';
import { Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area
} from 'recharts';
import { 
  FiPackage, FiTrendingUp, FiAward, FiUsers,
  FiStar, FiDollarSign, FiMapPin, FiFilter 
} from 'react-icons/fi';

const BreweryAnalytics = () => {
  // Sample data - replace with API data
  const breweryTypes = [
    { name: 'Micro', value: 65, breweries: 5465, trend: 12 },
    { name: 'Brewpub', value: 20, breweries: 1680, trend: 8 },
    { name: 'Nano', value: 8, breweries: 673, trend: 15 },
    { name: 'Regional', value: 5, breweries: 420, trend: 3 },
    { name: 'Large', value: 2, breweries: 170, trend: -2 },
  ];

  const sizeDistribution = [
    { range: '1-5', count: 45, label: '1-5 employees' },
    { range: '6-20', count: 30, label: '6-20 employees' },
    { range: '21-50', count: 15, label: '21-50 employees' },
    { range: '51-100', count: 6, label: '51-100 employees' },
    { range: '100+', count: 4, label: '100+ employees' },
  ];

  const establishmentYears = [
    { year: 'Before 1980', count: 5 },
    { year: '1980-1990', count: 8 },
    { year: '1991-2000', count: 12 },
    { year: '2001-2010', count: 25 },
    { year: '2011-2020', count: 45 },
    { year: '2021+', count: 5 },
  ];

  const radarData = [
    { subject: 'Micro', A: 120, B: 110, fullMark: 150 },
    { subject: 'Brewpub', A: 98, B: 130, fullMark: 150 },
    { subject: 'Nano', A: 86, B: 90, fullMark: 150 },
    { subject: 'Regional', A: 99, B: 85, fullMark: 150 },
    { subject: 'Large', A: 85, B: 90, fullMark: 150 },
  ];

  const COLORS = ['#FFC107', '#FFA000', '#FF8F00', '#FF6F00', '#FF5722'];
  const BLUES = ['#2196F3', '#1976D2', '#0D47A1', '#64B5F6', '#42A5F5'];

  return (
    <div className="brewery-analytics">
      <Row className="mb-4">
        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiPackage className="me-2 text-primary" />
                Brewery Types Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={breweryTypes}
                    layout="vertical"
                    margin={{
                      top: 20, right: 30, left: 20, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'breweries') return [value, 'Number of Breweries'];
                        if (name === 'trend') return [`${value}%`, 'Growth Trend'];
                        return [value, 'Percentage'];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="breweries" name="Number of Breweries" fill="#FFC107" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiUsers className="me-2 text-primary" />
                Size Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sizeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="label"
                      label={({ label, percent }) => `${label}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {sizeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={BLUES[index % BLUES.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiAward className="me-2 text-primary" />
                Establishment Timeline
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={establishmentYears}
                    margin={{
                      top: 10, right: 30, left: 0, bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FFC107" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#FFC107" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#FFC107" fillOpacity={1} fill="url(#colorCount)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiTrendingUp className="me-2 text-primary" />
                Performance Metrics
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} />
                    <Radar name="2023" dataKey="A" stroke="#FFC107" fill="#FFC107" fillOpacity={0.6} />
                    <Radar name="2024" dataKey="B" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col xl={12}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FiFilter className="me-2 text-primary" />
                  Detailed Brewery Metrics
                </h5>
                <div className="d-flex gap-2">
                  <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                    <option>All Regions</option>
                    <option>North America</option>
                    <option>Europe</option>
                    <option>Asia</option>
                  </select>
                  <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                    <option>All Types</option>
                    <option>Micro</option>
                    <option>Brewpub</option>
                    <option>Nano</option>
                    <option>Regional</option>
                    <option>Large</option>
                  </select>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Brewery Type</th>
                      <th className="text-center">Count</th>
                      <th className="text-center">% of Total</th>
                      <th>Avg. Employees</th>
                      <th>Avg. Production (bbl)</th>
                      <th>Avg. Rating</th>
                      <th>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { type: 'Micro', count: 5465, percent: 65, employees: 4, production: 1200, rating: 4.1, trend: 'up' },
                      { type: 'Brewpub', count: 1680, percent: 20, employees: 12, production: 800, rating: 4.3, trend: 'up' },
                      { type: 'Nano', count: 673, percent: 8, employees: 2, production: 500, rating: 4.2, trend: 'up' },
                      { type: 'Regional', count: 420, percent: 5, employees: 85, production: 15000, rating: 3.9, trend: 'steady' },
                      { type: 'Large', count: 170, percent: 2, employees: 250, production: 600000, rating: 3.7, trend: 'down' },
                    ].map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="bg-warning bg-opacity-10 p-1 rounded me-2">
                              <FiPackage className="text-warning" />
                            </div>
                            <strong>{item.type}</strong>
                          </div>
                        </td>
                        <td className="text-center">{item.count.toLocaleString()}</td>
                        <td className="text-center">{item.percent}%</td>
                        <td>{item.employees}</td>
                        <td>{item.production.toLocaleString()}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <FiStar className="text-warning me-1" />
                            {item.rating}
                          </div>
                        </td>
                        <td>
                          <Badge bg={item.trend === 'up' ? 'success' : item.trend === 'down' ? 'danger' : 'secondary'}>
                            {item.trend === 'up' ? 'Growing' : item.trend === 'down' ? 'Declining' : 'Stable'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BreweryAnalytics;
