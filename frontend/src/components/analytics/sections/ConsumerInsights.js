import React, { useState } from 'react';
import { Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';
import { FiUsers, FiHeart, FiMapPin, FiClock } from 'react-icons/fi';

const ConsumerInsights = () => {
  // Sample data
  const ageData = [
    { name: '18-24', value: 15, color: '#FFC107' },
    { name: '25-34', value: 35, color: '#FFA000' },
    { name: '35-44', value: 28, color: '#FF8F00' },
    { name: '45-54', value: 15, color: '#FF6F00' },
    { name: '55+', value: 7, color: '#E65100' },
  ];

  const flavorData = [
    { subject: 'Hoppy', A: 85, B: 90 },
    { subject: 'Malty', A: 75, B: 70 },
    { subject: 'Fruity', A: 65, B: 75 },
    { subject: 'Roasty', A: 55, B: 60 },
    { subject: 'Sour', A: 45, B: 50 },
  ];

  return (
    <div className="consumer-insights">
      <Tabs defaultActiveKey="demographics" className="mb-4">
        <Tab eventKey="demographics" title="Demographics">
          <Row>
            <Col xl={6} className="mb-4">
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white border-0">
                  <h5 className="mb-0">
                    <FiUsers className="me-2 text-primary" />
                    Age Distribution
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={ageData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={120}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {ageData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
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
                    <FiHeart className="me-2 text-primary" />
                    Flavor Preferences
                  </h5>
                </Card.Header>
                <Card.Body>
                  <div style={{ height: '400px' }}>
                    <ResponsiveContainer>
                      <RadarChart data={flavorData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar name="Our Customers" dataKey="A" stroke="#FFC107" fill="#FFC107" fillOpacity={0.6} />
                        <Radar name="Market Avg" dataKey="B" stroke="#2196F3" fill="#2196F3" fillOpacity={0.6} />
                        <Legend />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default ConsumerInsights;
