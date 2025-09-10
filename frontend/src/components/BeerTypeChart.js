import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import '../components/Charts.css';

const COLORS = ['#FFC107', '#198754', '#0D6EFD'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip" style={{
        backgroundColor: '#fff',
        padding: '12px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        maxWidth: '200px'
      }}>
        <p className="mb-1" style={{ 
          color: '#4a5568', 
          fontWeight: 600, 
          margin: 0, 
          fontSize: '0.9rem'
        }}>
          {payload[0].name}
        </p>
        <p style={{ 
          color: '#2d3748', 
          fontWeight: 700, 
          margin: 0, 
          fontSize: '1.1rem',
          color: payload[0].payload.fill
        }}>
          {payload[0].value.toLocaleString()}
        </p>
        <p style={{ 
          color: '#718096', 
          margin: '4px 0 0 0', 
          fontSize: '0.8rem'
        }}>
          {`${(payload[0].payload.percent * 100).toFixed(1)}% of total`}
        </p>
      </div>
    );
  }
  return null;
};

const BeerTypeChart = ({ data }) => {
  // Ensure we have valid data
  if (!data) {
    return (
      <div className="chart-container d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-2x text-muted mb-3"></i>
          <p className="text-muted">Loading chart data...</p>
        </div>
      </div>
    );
  }

  const chartData = [
    { 
      name: 'Ale Beers', 
      value: data.ale_beers || 0,
      color: COLORS[0]
    },
    { 
      name: 'Lager Beers', 
      value: data.lager_beers || 0,
      color: COLORS[1]
    },
    { 
      name: 'Other Beers', 
      value: data.other_beers || 0,
      color: COLORS[2]
    },
  ].filter(item => item.value > 0); // Only show categories with data

  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // If no data is available
  if (total === 0) {
    return (
      <div className="chart-container d-flex align-items-center justify-content-center" style={{ minHeight: '300px' }}>
        <div className="text-center">
          <i className="fas fa-chart-pie fa-3x text-muted mb-3"></i>
          <p className="text-muted">No beer type data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-container chart-enter" style={{ height: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              innerRadius={60}
              paddingAngle={2}
              dataKey="value"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color}
                  stroke="#fff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{
                paddingTop: '1rem',
                fontSize: '0.875rem',
                marginBottom: '-10px'
              }}
              formatter={(value, entry, index) => (
                <span style={{ color: '#4a5568', fontSize: '0.85rem' }}>
                  {value}
                </span>
              )}
              iconType="circle"
              iconSize={10}
            />
          </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BeerTypeChart;
