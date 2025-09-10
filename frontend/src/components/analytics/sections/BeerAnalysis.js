import React, { useState } from 'react';
import { Row, Col, Card, Table, Badge, ButtonGroup, Button } from 'react-bootstrap';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, 
  ZAxis, ComposedChart, Area, PieChart, Pie, Cell, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap
} from 'recharts';
import { 
  FiDroplet, FiTrendingUp, FiAward, FiFilter, 
  FiStar, FiDollarSign, FiClock, FiPieChart
} from 'react-icons/fi';

const BeerAnalysis = () => {
  // Sample data - replace with API data
  const beerStyles = [
    { name: 'IPA', count: 1250, abv: 6.5, ibu: 65, trend: 8, category: 'Ale' },
    { name: 'Pale Ale', count: 980, abv: 5.2, ibu: 35, trend: 5, category: 'Ale' },
    { name: 'Stout', count: 850, abv: 7.2, ibu: 45, trend: 12, category: 'Stout' },
    { name: 'Lager', count: 1200, abv: 4.8, ibu: 20, trend: -3, category: 'Lager' },
    { name: 'Sour', count: 620, abv: 4.2, ibu: 15, trend: 25, category: 'Sour' },
    { name: 'Porter', count: 580, abv: 5.8, ibu: 30, trend: 10, category: 'Stout' },
    { name: 'Pilsner', count: 750, abv: 4.6, ibu: 25, trend: -2, category: 'Lager' },
    { name: 'Wheat Beer', count: 680, abv: 4.8, ibu: 18, trend: 8, category: 'Wheat' },
  ];

  const abvDistribution = [
    { range: '0-3%', count: 8 },
    { range: '3-4%', count: 15 },
    { range: '4-5%', count: 25 },
    { range: '5-6%', count: 30 },
    { range: '6-7%', count: 12 },
    { range: '7-8%', count: 6 },
    { range: '8-9%', count: 3 },
    { range: '9%+', count: 1 },
  ];

  const flavorProfiles = [
    { name: 'Hoppy', value: 45 },
    { name: 'Malty', value: 30 },
    { name: 'Fruity', value: 35 },
    { name: 'Roasty', value: 25 },
    { name: 'Sour', value: 20 },
    { name: 'Spicy', value: 15 },
  ];

  const seasonalTrends = [
    { month: 'Jan', style: 'Stout', popularity: 85 },
    { month: 'Feb', style: 'Stout', popularity: 80 },
    { month: 'Mar', style: 'Porter', popularity: 75 },
    { month: 'Apr', style: 'Amber', popularity: 70 },
    { month: 'May', style: 'IPA', popularity: 78 },
    { month: 'Jun', style: 'Wheat', popularity: 90 },
    { month: 'Jul', style: 'Sour', popularity: 95 },
    { month: 'Aug', style: 'Pale Ale', popularity: 92 },
    { month: 'Sep', style: 'Oktoberfest', popularity: 85 },
    { month: 'Oct', style: 'Pumpkin', popularity: 88 },
    { month: 'Nov', style: 'Brown Ale', popularity: 75 },
    { month: 'Dec', style: 'Winter Warmer', popularity: 82 },
  ];

  const COLORS = ['#FFC107', '#2196F3', '#4CAF50', '#FF5722', '#9C27B0', '#607D8B'];
  const CATEGORY_COLORS = {
    'Ale': '#FFC107',
    'Lager': '#2196F3',
    'Stout': '#795548',
    'Sour': '#4CAF50',
    'Wheat': '#FFEB3B',
    'Other': '#9E9E9E'
  };

  const [activeFilter, setActiveFilter] = useState('all');

  const filteredBeerStyles = activeFilter === 'all' 
    ? beerStyles 
    : beerStyles.filter(style => style.category === activeFilter);

  return (
    <div className="beer-analysis">
      <Row className="mb-4">
        <Col lg={8}>
          <h4>Beer Style Analysis</h4>
          <p className="text-muted">Comprehensive analysis of beer styles, ABV distribution, and flavor profiles</p>
        </Col>
        <Col lg={4} className="text-lg-end">
          <ButtonGroup size="sm">
            <Button 
              variant={activeFilter === 'all' ? 'warning' : 'outline-secondary'}
              onClick={() => setActiveFilter('all')}
            >
              All Styles
            </Button>
            {[...new Set(beerStyles.map(style => style.category))].map(category => (
              <Button 
                key={category}
                variant={activeFilter === category ? 'warning' : 'outline-secondary'}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </Button>
            ))}
          </ButtonGroup>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xl={8} lg={12} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiDroplet className="me-2 text-primary" />
                Beer Styles Overview
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={filteredBeerStyles}
                    margin={{
                      top: 20, right: 30, left: 20, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#FFC107" />
                    <YAxis yAxisId="right" orientation="right" stroke="#2196F3" />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'abv') return [value, 'ABV %'];
                        if (name === 'ibu') return [value, 'IBU'];
                        if (name === 'trend') return [`${value}%`, 'Trend'];
                        return [value, 'Count'];
                      }}
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" name="Number of Beers" fill="#FFC107" />
                    <Line yAxisId="right" type="monotone" dataKey="abv" name="ABV %" stroke="#2196F3" dot={false} />
                    <Line yAxisId="right" type="monotone" dataKey="ibu" name="IBU" stroke="#4CAF50" dot={false} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4} lg={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiPieChart className="me-2 text-primary" />
                ABV Distribution
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={abvDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="range"
                      label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {abvDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}% of beers`, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiTrendingUp className="me-2 text-primary" />
                Seasonal Trends
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={seasonalTrends}
                    margin={{
                      top: 5, right: 30, left: 20, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => [`${value}% popularity`, name]}
                      labelFormatter={(month) => `Month: ${month}`}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="popularity" 
                      name="Popularity %" 
                      stroke="#FFC107" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiAward className="me-2 text-primary" />
                Flavor Profiles
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={flavorProfiles}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar 
                      name="Flavor Intensity" 
                      dataKey="value" 
                      stroke="#FFC107" 
                      fill="#FFC107" 
                      fillOpacity={0.6} 
                    />
                    <Tooltip formatter={(value) => [`${value}% intensity`, '']} />
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
                  Detailed Beer Style Metrics
                </h5>
                <div className="d-flex gap-2">
                  <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                    <option>All Categories</option>
                    {[...new Set(beerStyles.map(style => style.category))].map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  <select className="form-select form-select-sm" style={{ width: 'auto' }}>
                    <option>Sort by Popularity</option>
                    <option>Sort by ABV</option>
                    <option>Sort by IBU</option>
                    <option>Sort by Trend</option>
                  </select>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Beer Style</th>
                      <th>Category</th>
                      <th className="text-end">Count</th>
                      <th className="text-end">Avg. ABV</th>
                      <th className="text-end">Avg. IBU</th>
                      <th>Trend</th>
                      <th>Popularity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBeerStyles.map((style, idx) => (
                      <tr key={idx}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="me-2" 
                              style={{
                                width: '16px', 
                                height: '16px', 
                                backgroundColor: CATEGORY_COLORS[style.category] || '#9E9E9E',
                                borderRadius: '3px'
                              }}
                            ></div>
                            <strong>{style.name}</strong>
                          </div>
                        </td>
                        <td>{style.category}</td>
                        <td className="text-end">{style.count.toLocaleString()}</td>
                        <td className="text-end">{style.abv}%</td>
                        <td className="text-end">{style.ibu}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            {style.trend > 0 ? (
                              <FiTrendingUp className="text-success me-1" />
                            ) : style.trend < 0 ? (
                              <FiTrendingUp className="text-danger me-1" style={{ transform: 'rotate(180deg)' }} />
                            ) : (
                              <span className="text-muted">-</span>
                            )}
                            {style.trend !== 0 && `${Math.abs(style.trend)}%`}
                          </div>
                        </td>
                        <td>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar ${style.trend > 0 ? 'bg-success' : 'bg-warning'}`} 
                              role="progressbar" 
                              style={{ width: `${(style.count / 1250) * 100}%` }}
                              aria-valuenow={(style.count / 1250) * 100}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            ></div>
                          </div>
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

export default BeerAnalysis;
