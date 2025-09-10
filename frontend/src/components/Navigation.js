import React from 'react';
import { Navbar, Nav, Container, Badge } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

function Navigation() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar 
      className="modern-navbar" 
      variant="dark" 
      expand="lg" 
      sticky="top"
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="brand-logo ps-2">
          <i className="fas fa-beer brand-icon me-2"></i>
          <span className="brand-text">Beer Recipe Intelligence</span>
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
              className={`nav-item ps-4 ${isActive('/analytics') ? 'active' : ''}`}
            >
              <i className="fas fa-chart-line nav-icon me-3"></i>
              <span className="nav-text">Analytics</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/enhanced-analytics" 
              className={`nav-item ${isActive('/enhanced-analytics') ? 'active' : ''}`}
            >
              <i className="fas fa-chart-pie nav-icon"></i>
              <span className="nav-text">Enhanced Analytics</span>
              <Badge bg="warning" className="ms-1">New</Badge>
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
  );
}

export default Navigation;
