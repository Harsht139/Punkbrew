import React, { useState } from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { LinkContainer } from 'react-router-bootstrap';
import { FaBeer, FaSearch, FaMapMarkerAlt, FaDatabase, FaCog } from 'react-icons/fa';
import './Navigation.css';

function Navigation() {
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar 
      className="modern-navbar px-0" 
      variant="dark" 
      expand="lg" 
      sticky="top"
      expanded={expanded}
    >
      <Container fluid className="px-0">
        <Navbar.Brand as={Link} to="/" className="brand-logo ms-3">
          <FaBeer className="brand-icon me-2" />
          <span className="brand-text">Beer Recipe Intelligence</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="navbar-nav" className="border-0 me-3" onClick={() => setExpanded(expanded ? false : true)} />
        
        <Navbar.Collapse id="navbar-nav">
          <Nav className="w-100 d-flex justify-content-between">
            <Nav.Link 
              as={Link} 
              to="/" 
              className={`nav-item ${isActive('/') ? 'active' : ''}`}
              onClick={() => setExpanded(false)}
            >
              <FaCog className="me-1" />
              <span className="nav-text">Dashboard</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/search" 
              className={`nav-item ${isActive('/search') ? 'active' : ''}`}
              onClick={() => setExpanded(false)}
            >
              <FaSearch className="me-1" />
              <span className="nav-text">Search</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/geographic" 
              className={`nav-item ${isActive('/geographic') ? 'active' : ''}`}
              onClick={() => setExpanded(false)}
            >
              <FaMapMarkerAlt className="me-1" />
              <span className="nav-text">Locations</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/analytics" 
              className={`nav-item ${isActive('/analytics') ? 'active' : ''}`}
              onClick={() => setExpanded(false)}
            >
              <FaDatabase className="me-1" />
              <span className="nav-text">Enhanced Analytics</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/looker" 
              className={`nav-item ${isActive('/looker') ? 'active' : ''}`}
              onClick={() => setExpanded(false)}
            >
              <FaDatabase className="me-1" />
              <span className="nav-text">Looker Studio</span>
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/pipeline" 
              className={`nav-item ${isActive('/pipeline') ? 'active' : ''}`}
              onClick={() => setExpanded(false)}
            >
              <FaCog className="me-1" />
              <span className="nav-text">Pipeline</span>
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;
