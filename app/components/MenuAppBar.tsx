'use client'

import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, MenuItem, Menu } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Added this
import AccountCircle from '@mui/icons-material/AccountCircle';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function MenuAppBar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Define which paths are "roots" where we show the Hamburger instead of Back
  const ROOT_PATHS = ['/dashboard', '/login']; 
  const isRoot = ROOT_PATHS.includes(pathname);

  const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Home',
    '/calendar': 'Calendar',
    '/settings': 'Settings',
    '/login': 'Welcome Back',
    '/profile': 'Profile',
    '/tasks': 'Details',
  };

  const rootPath = `/${pathname.split('/')[1]}`;

  const handleLogout = async () => {
    try {
      setAnchorEl(null);
      router.push('/login');
      await signOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box sx={{ flexGrow: 0 }}>
      <AppBar position="static" sx={{ bgcolor: 'background.default', borderBottom: 1, borderColor: 'divider', color: 'text.primary', boxShadow: 'none' }}>
        <Toolbar>
          {/* Back Button */}
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="navigation"
            sx={{ mr: 2 }}
            onClick={() => !isRoot ? router.back() : null} // Goes back if not root
            disableRipple={!isRoot} // Don't let the ripple transfer to the menu
          >
            {isRoot ? <MenuIcon /> : <ArrowBackIcon />}
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {PAGE_TITLES[pathname] || PAGE_TITLES[rootPath] || 'App'}
          </Typography>

          {user && (
            <div>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <Typography sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider', cursor: 'default', userSelect: 'none', fontSize: '0.875rem' }}>
                    {auth.currentUser?.email}
                </Typography>
                <MenuItem onClick={handleClose} component={Link} href='/profile'>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}