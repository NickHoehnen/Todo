'use client'

import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, IconButton, MenuItem, Menu } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Adjust this path to your firebase config
import { Delete } from '@mui/icons-material';

export default function MenuAppBar() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Handle Logout Logic
  const handleLogout = async () => {
    try {
      setAnchorEl(null);
      router.push('/login')
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
          <IconButton size="large" edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {pathname === '/' ? 'Home' : pathname.charAt(1).toUpperCase() + pathname.slice(2)}
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
                <Typography sx={{ display: 'fixed', px: 2, mb: 1}}>{auth.currentUser?.email}</Typography>
                <MenuItem onClick={handleClose} component={Link} href='/profile'>Profile</MenuItem>
                <MenuItem onClick={handleClose}>My account</MenuItem>
                {/* Logout Trigger */}
                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Logout</MenuItem>
              </Menu>
            </div>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}