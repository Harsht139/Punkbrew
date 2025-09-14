import React from 'react';
import { Container } from 'react-bootstrap';
import { Helmet } from 'react-helmet';

/**
 * LookerDashboard - A component that embeds a Looker Studio dashboard
 * This component provides a full-screen iframe for the Looker Studio dashboard
 * with proper responsive sizing and security sandboxing.
 */
const LookerDashboard = () => {
  // URL for the Looker Studio dashboard
  const dashboardUrl = "https://lookerstudio.google.com/embed/reporting/9f3c90b4-afff-42f1-a925-95baeb7620b8/page/BlnXF";

  return (
    <Container fluid className="p-0">
      <Helmet>
        <title>Brewery Analytics Dashboard | Looker Studio</title>
        <meta name="description" content="Interactive brewery analytics dashboard powered by Looker Studio" />
      </Helmet>
      
      <div 
        className="dashboard-container" 
        style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 60px)',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa'
        }}
      >
        <iframe
          src={dashboardUrl}
          width="100%"
          height="100%"
          frameBorder="0"
          style={{
            border: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden'
          }}
          allowFullScreen
          sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          title="Brewery Analytics Dashboard"
        />
      </div>
    </Container>
  );
};

export default LookerDashboard;
