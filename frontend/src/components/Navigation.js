import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <Navbar 
        className="modern-navbar shadow-sm" 
        variant="dark" 
        expand="lg" 
        sticky="top"
      >
        <Container>
          {/* Brand */}
          <Navbar.Brand as={Link} to="/" className="brand-logo">
            <i className="fas fa-beer brand-icon"></i>
            <span className="brand-text">Beer Recipe Intelligence</span>
            <Badge bg="success" className="ms-2 version-badge">v2.0</Badge>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="navbar-nav" className="border-0" />
          
          <Navbar.Collapse id="navbar-nav">
            {/* Main Navigation */}
            <Nav className="me-auto nav-links">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={`nav-item ${isActive('/') ? 'active' : ''}`}
              >
                <i className="fas fa-home nav-icon"></i>
                <span className="nav-text">Dashboard</span>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/analytics" 
                className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}
              >
                <i className="fas fa-chart-line nav-icon"></i>
                <span className="nav-text">Analytics</span>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/looker" 
                className={`nav-item ${isActive('/looker') ? 'active' : ''}`}
              >
                <i className="fas fa-chart-pie nav-icon"></i>
                <span className="nav-text">Looker Studio</span>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/search" 
                className={`nav-item ${isActive('/search') ? 'active' : ''}`}
              >
                <i className="fas fa-search nav-icon"></i>
                <span className="nav-text">Search</span>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/geographic" 
                className={`nav-item ${isActive('/geographic') ? 'active' : ''}`}
              >
                <i className="fas fa-globe nav-icon"></i>
                <span className="nav-text">Geographic</span>
              </Nav.Link>
              
              <Nav.Link 
                as={Link} 
                to="/pipeline" 
                className={`nav-item ${isActive('/pipeline') ? 'active' : ''}`}
              >
                <i className="fas fa-cogs nav-icon"></i>
                <span className="nav-text">Pipeline</span>
              </Nav.Link>
            </Nav>
            
            {/* Right Side Actions */}
            <Nav className="navbar-actions">
              <Nav.Link className="action-item notification-item">
                <i className="fas fa-bell"></i>
                <Badge bg="danger" className="notification-badge">3</Badge>
              </Nav.Link>
              
              <Nav.Link className="action-item profile-item">
                <i className="fas fa-user-circle"></i>
                <span className="profile-text">Profile</span>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      {/* Custom Styles */}
      <style jsx>{`
        .modern-navbar {
          background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%) !important;
          border-bottom: 3px solid #f39c12;
          padding: 0.75rem 0;
          transition: all 0.3s ease;
        }
        
        .brand-logo {
          display: flex;
          align-items: center;
          font-weight: 700;
          font-size: 1.4rem;
          color: #fff !important;
          text-decoration: none;
          transition: all 0.3s ease;
        }
        
        .brand-logo:hover {
          color: #f39c12 !important;
          transform: translateY(-1px);
        }
        
        .brand-icon {
          font-size: 1.6rem;
          margin-right: 0.75rem;
          color: #f39c12;
          animation: pulse 2s infinite;
        }
        
        .brand-text {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          letter-spacing: -0.5px;
        }
        
        .version-badge {
          font-size: 0.7rem;
          padding: 0.2rem 0.4rem;
        }
        
        .nav-links {
          margin-left: 2rem;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.6rem 1.2rem !important;
          margin: 0 0.2rem;
          border-radius: 8px;
          color: #ecf0f1 !important;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        
        .nav-item:hover {
          background: rgba(243, 156, 18, 0.1);
          color: #f39c12 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        
        .nav-item.active {
          background: linear-gradient(135deg, #f39c12, #e67e22);
          color: #fff !important;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(243, 156, 18, 0.3);
        }
        
        .nav-item.active::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: #fff;
        }
        
        .nav-icon {
          font-size: 1.1rem;
          margin-right: 0.6rem;
          width: 20px;
          text-align: center;
        }
        
        .nav-text {
          font-size: 0.95rem;
        }
        
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .action-item {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.8rem !important;
          border-radius: 6px;
          color: #ecf0f1 !important;
          text-decoration: none;
          transition: all 0.3s ease;
          position: relative;
        }
        
        .action-item:hover {
          background: rgba(255, 255, 255, 0.1);
          color: #f39c12 !important;
        }
        
        .notification-item {
          position: relative;
        }
        
        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          font-size: 0.6rem;
          padding: 0.15rem 0.3rem;
        }
        
        .profile-item {
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .profile-text {
          margin-left: 0.5rem;
          font-size: 0.9rem;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        
        @media (max-width: 991px) {
          .nav-links {
            margin-left: 0;
            margin-top: 1rem;
          }
          
          .navbar-actions {
            margin-top: 1rem;
            justify-content: center;
          }
          
          .nav-item {
            margin: 0.2rem 0;
          }
        }
      `}</style>
    </>
  );
}

export default Navigation;
