import React from 'react';
import { Row, Col, Card, ButtonGroup, Button } from 'react-bootstrap';
import { 
  FiPackage, FiAward, FiTrendingUp, FiUsers,
  FiDroplet, FiStar, FiDollarSign, FiMapPin 
} from 'react-icons/fi';

const SummaryCards = ({ timeRange, onTimeRangeChange }) => {
  // Sample data - replace with props from parent
  const metrics = [
    { 
      title: 'Total Breweries', 
      value: '8,408', 
      change: 12.5,
      icon: <FiPackage size={24} className="text-warning" />,
      color: 'warning'
    },
    { 
      title: 'Avg. ABV', 
      value: '5.2%', 
      change: 1.2,
      icon: <FiDroplet size={24} className="text-info" />,
      color: 'info'
    },
    { 
      title: 'Avg. Rating', 
      value: '4.1', 
      change: 0.3,
      icon: <FiStar size={24} className="text-warning" />,
      color: 'warning'
    },
    { 
      title: 'Countries', 
      value: '92', 
      change: 2,
      icon: <FiMapPin size={24} className="text-success" />,
      color: 'success'
    },
  ];

  return (
    <>
      <Row className="mb-4">
        <Col md={8}>
          <h4 className="mb-0">Key Metrics</h4>
          <p className="text-muted mb-0">Overview of the craft beer industry</p>
        </Col>
        <Col md={4} className="text-md-end">
          <ButtonGroup size="sm" className="mb-3">
            <Button 
              variant={timeRange === 'week' ? 'warning' : 'outline-secondary'}
              onClick={() => onTimeRangeChange('week')}
            >
              Week
            </Button>
            <Button 
              variant={timeRange === 'month' ? 'warning' : 'outline-secondary'}
              onClick={() => onTimeRangeChange('month')}
            >
              Month
            </Button>
            <Button 
              variant={timeRange === 'year' ? 'warning' : 'outline-secondary'}
              onClick={() => onTimeRangeChange('year')}
            >
              Year
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
      
      <Row className="mb-4">
        {metrics.map((metric, index) => (
          <Col xl={3} lg={6} className="mb-4" key={index}>
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted mb-1">{metric.title}</h6>
                    <h2 className="mb-0">{metric.value}</h2>
                    <small className={metric.change >= 0 ? "text-success" : "text-danger"}>
                      <FiTrendingUp className="me-1" />
                      {metric.change}% from last {timeRange}
                    </small>
                  </div>
                  <div className={`bg-${metric.color} bg-opacity-10 p-3 rounded-circle`}>
                    {metric.icon}
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default SummaryCards;
