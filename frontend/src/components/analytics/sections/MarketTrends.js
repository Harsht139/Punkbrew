import React, { useState } from 'react';
import { Row, Col, Card, Table, Tabs, Tab, Form } from 'react-bootstrap';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area,
  ScatterChart, Scatter, ZAxis, ReferenceLine, ComposedChart
} from 'recharts';
import { 
  FiTrendingUp, FiDollarSign, FiFilter, FiDownload, 
  FiShoppingCart, FiTag, FiCalendar, FiPieChart
} from 'react-icons/fi';

const MarketTrends = () => {
  const [timeRange, setTimeRange] = useState('year');
  const [category, setCategory] = useState('all');
  
  // Sample data - replace with API data
  const priceTrends = [
    { month: 'Jan', avgPrice: 8.50, high: 12.00, low: 6.00 },
    { month: 'Feb', avgPrice: 8.75, high: 12.50, low: 6.25 },
    { month: 'Mar', avgPrice: 8.90, high: 12.75, low: 6.50 },
    { month: 'Apr', avgPrice: 9.10, high: 13.00, low: 6.75 },
    { month: 'May', avgPrice: 9.30, high: 13.25, low: 7.00 },
    { month: 'Jun', avgPrice: 9.50, high: 13.50, low: 7.25 },
    { month: 'Jul', avgPrice: 9.40, high: 13.25, low: 7.00 },
    { month: 'Aug', avgPrice: 9.25, high: 13.00, low: 6.75 },
    { month: 'Sep', avgPrice: 9.00, high: 12.75, low: 6.50 },
    { month: 'Oct', avgPrice: 8.80, high: 12.50, low: 6.25 },
    { month: 'Nov', avgPrice: 8.65, high: 12.25, low: 6.00 },
    { month: 'Dec', avgPrice: 8.75, high: 12.50, low: 6.25 },
  ];

  const marketShare = [
    { category: 'Craft Beer', value: 25.4, trend: 1.2 },
    { category: 'Domestic', value: 45.8, trend: -0.8 },
    { category: 'Import', value: 16.3, trend: 0.5 },
    { category: 'Cider', value: 5.2, trend: 0.7 },
    { category: 'Hard Seltzer', value: 7.3, trend: 2.1 },
  ];

  const seasonalData = [
    { name: 'Winter', ipa: 35, lager: 25, stout: 40, wheat: 15 },
    { name: 'Spring', ipa: 40, lager: 30, stout: 25, wheat: 35 },
    { name: 'Summer', ipa: 45, lager: 45, stout: 10, wheat: 40 },
    { name: 'Fall', ipa: 50, lager: 35, stout: 30, wheat: 25 },
  ];

  const COLORS = ['#FFC107', '#2196F3', '#4CAF50', '#FF5722', '#9C27B0'];

  return (
    <div className="market-trends">
      <Row className="mb-4">
        <Col md={8}>
          <h4>Market Trends & Analysis</h4>
          <p className="text-muted">Comprehensive market insights and pricing trends</p>
        </Col>
        <Col md={4} className="text-md-end">
          <div className="d-flex gap-2 justify-content-end">
            <Form.Select 
              size="sm" 
              style={{ width: 'auto' }}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <option value="month">Last 30 Days</option>
              <option value="quarter">Last 90 Days</option>
              <option value="year">Last 12 Months</option>
              <option value="all">All Time</option>
            </Form.Select>
            <Form.Select 
              size="sm" 
              style={{ width: 'auto' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="ipa">IPA</option>
              <option value="lager">Lager</option>
              <option value="stout">Stout</option>
              <option value="wheat">Wheat Beer</option>
            </Form.Select>
            <button className="btn btn-sm btn-outline-secondary">
              <FiDownload size={16} />
            </button>
          </div>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col xl={8} lg={12} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiDollarSign className="me-2 text-primary" />
                Price Trends
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={priceTrends}
                    margin={{
                      top: 20, right: 30, left: 20, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value, name) => {
                        if (name === 'avgPrice') return [`$${value.toFixed(2)}`, 'Average Price'];
                        if (name === 'high') return [`$${value.toFixed(2)}`, 'High'];
                        if (name === 'low') return [`$${value.toFixed(2)}`, 'Low'];
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="high" fill="#e3f2fd" stroke="#2196F3" fillOpacity={0.5} />
                    <Area type="monotone" dataKey="low" fill="#fff3e0" stroke="#FF9800" fillOpacity={0.5} />
                    <Line type="monotone" dataKey="avgPrice" stroke="#4CAF50" strokeWidth={2} dot={false} />
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
                Market Share
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={marketShare}
                    margin={{
                      top: 20, right: 30, left: 20, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" />
                    <YAxis dataKey="category" type="category" width={100} />
                    <Tooltip 
                      formatter={(value, name) => [`${value}%`, name]}
                      labelFormatter={(label) => `Category: ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="value" name="Market Share %" fill="#FFC107" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">
                <FiCalendar className="me-2 text-primary" />
                Seasonal Trends
              </h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={seasonalData}
                    margin={{
                      top: 5, right: 30, left: 20, bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ipa" name="IPA" stroke="#FF5722" />
                    <Line type="monotone" dataKey="lager" name="Lager" stroke="#2196F3" />
                    <Line type="monotone" dataKey="stout" name="Stout" stroke="#795548" />
                    <Line type="monotone" dataKey="wheat" name="Wheat" stroke="#FFC107" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <FiShoppingCart className="me-2 text-primary" />
                  Price vs. Popularity
                </h5>
                <div className="text-muted small">
                  Hover points for details
                </div>
              </div>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart
                    margin={{
                      top: 20, right: 20, bottom: 20, left: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis type="number" dataKey="price" name="Price ($)" unit="$" />
                    <YAxis type="number" dataKey="popularity" name="Popularity" />
                    <ZAxis type="number" dataKey="volume" range={[60, 400]} name="Volume" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Legend />
                    <Scatter name="Craft Beers" data={[
                      { price: 8.99, popularity: 85, volume: 1200 },
                      { price: 12.99, popularity: 92, volume: 800 },
                      { price: 6.99, popularity: 78, volume: 1500 },
                      { price: 9.99, popularity: 88, volume: 1100 },
                      { price: 14.99, popularity: 90, volume: 700 },
                      { price: 7.99, popularity: 82, volume: 1300 },
                      { price: 10.99, popularity: 89, volume: 950 },
                      { price: 5.99, popularity: 75, volume: 1800 },
                    ]} fill="#4CAF50" />
                    <ReferenceLine x={9.5} stroke="#FF5722" label="Avg. Price" />
                    <ReferenceLine y={85} stroke="#2196F3" label="Avg. Popularity" />
                  </ScatterChart>
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
                  <FiTag className="me-2 text-primary" />
                  Competitive Analysis
                </h5>
                <div className="text-muted small">
                  Last updated: {new Date().toLocaleDateString()}
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Tabs defaultActiveKey="pricing" className="px-3 pt-2">
                <Tab eventKey="pricing" title="Pricing Strategy">
                  <div className="p-3">
                    <p className="text-muted">
                      Our pricing strategy focuses on the premium craft beer segment, 
                      with an average price point of $9.50, slightly below the market 
                      average of $9.80 for similar quality products.
                    </p>
                    <div className="table-responsive">
                      <Table hover className="mb-0">
                        <thead className="bg-light">
                          <tr>
                            <th>Segment</th>
                            <th className="text-end">Our Price</th>
                            <th className="text-end">Market Avg.</th>
                            <th className="text-end">Difference</th>
                            <th>Positioning</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { segment: 'Entry-Level', ourPrice: 6.99, marketAvg: 7.50, positioning: 'Competitive' },
                            { segment: 'Mainstream', ourPrice: 9.99, marketAvg: 9.80, positioning: 'Premium' },
                            { segment: 'Specialty', ourPrice: 14.99, marketAvg: 15.50, positioning: 'Value' },
                            { segment: 'Limited Edition', ourPrice: 19.99, marketAvg: 22.00, positioning: 'Premium' },
                          ].map((item, idx) => (
                            <tr key={idx}>
                              <td>{item.segment}</td>
                              <td className="text-end">${item.ourPrice.toFixed(2)}</td>
                              <td className="text-end">${item.marketAvg.toFixed(2)}</td>
                              <td className={`text-end ${item.ourPrice < item.marketAvg ? 'text-success' : 'text-danger'}`}>
                                {item.ourPrice < item.marketAvg ? '↓' : '↑'} ${Math.abs(item.ourPrice - item.marketAvg).toFixed(2)}
                              </td>
                              <td>
                                <span className={`badge ${item.positioning === 'Premium' ? 'bg-warning' : 'bg-success'}`}>
                                  {item.positioning}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </div>
                </Tab>
                <Tab eventKey="segmentation" title="Market Segmentation">
                  <div className="p-3">
                    <p className="text-muted">
                      Our target market segments based on consumer behavior and preferences.
                    </p>
                    <Row>
                      {[
                        { 
                          name: 'Craft Enthusiasts', 
                          description: 'Willing to pay premium for unique flavors',
                          size: '35%',
                          growth: '12% YoY'
                        },
                        { 
                          name: 'Casual Drinkers', 
                          description: 'Prefer approachable, sessionable styles',
                          size: '45%',
                          growth: '5% YoY'
                        },
                        { 
                          name: 'Flavor Explorers', 
                          description: 'Seek experimental and limited releases',
                          size: '20%',
                          growth: '18% YoY'
                        },
                      ].map((segment, idx) => (
                        <Col md={4} key={idx} className="mb-3">
                          <Card className="h-100 border-0 shadow-sm">
                            <Card.Body>
                              <h6 className="mb-1">{segment.name}</h6>
                              <p className="small text-muted mb-2">{segment.description}</p>
                              <div className="d-flex justify-content-between small">
                                <span>Market Share:</span>
                                <strong>{segment.size}</strong>
                              </div>
                              <div className="d-flex justify-content-between small">
                                <span>Growth:</span>
                                <strong className={segment.growth.includes('↑') ? 'text-success' : 'text-danger'}>
                                  {segment.growth}
                                </strong>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MarketTrends;
