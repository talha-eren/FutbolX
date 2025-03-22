import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import { Home, AddCircle, Person } from '@mui/icons-material';

function Navbar() {
  return (
    <AppBar position="fixed" color="default" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit', flexGrow: 1 }}>
          FutbolX
        </Typography>
        <IconButton component={Link} to="/" color="inherit">
          <Home />
        </IconButton>
        <IconButton component={Link} to="/upload" color="inherit">
          <AddCircle />
        </IconButton>
        <IconButton component={Link} to="/profile" color="inherit">
          <Person />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;
