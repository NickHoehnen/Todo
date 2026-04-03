'use client'

import { Box, ButtonBase, CircularProgress, Grow } from "@mui/material"
import { usePathname, useRouter } from "next/navigation" // Import this
import Home from '@mui/icons-material/Home';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import { ReactNode, useEffect } from "react";
import MenuAppBar from "../components/MenuAppBar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Layout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [user, loading, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100dvh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Helper to determine active tab based on root path
  const rootPath = `/${pathname.split('/')[1]}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <MenuAppBar />

      {/* Main content area */}
      <Box 
        component='main' 
        sx={{ 
          flexGrow: 1, 
          overflowY: 'auto', 
          WebkitOverflowScrolling: 'touch', 
          py: 1,
          px: 1,
          bgcolor: 'background.paper',
        }}
      >
          {children}
      </Box>

      {/* Navigation area */}
      <Box sx={{ pb: 'calc(env(safe-area-inset-bottom)/2)', bgcolor: 'background.default' }}>
        <Box 
          sx={{
            width: '100%',
            height: '4rem',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            bgcolor: 'background.default',
          }}
        >
          {[
            { href: '/calendar', label: 'Calendar', icon: <CalendarMonth color={rootPath === '/calendar' ? 'primary' : 'action'} /> },
            { href: '/dashboard', label: 'Dashboard', icon: <Home fontSize="large" color={rootPath === '/dashboard' ? 'primary' : 'action'} /> },
            { href: '/settings', label: 'Settings', icon: <SettingsIcon color={rootPath === '/settings' ? 'primary' : 'action'} /> },
          ].map((item, index) => (
            <Grow
              key={item.href} 
              in={!loading} 
              style={{ transformOrigin: '0 0 0' }}
              timeout={(index + 1) * 800} // Grow one-by-one
              appear
            >
              <ButtonBase 
                component={Link} 
                href={item.href} 
                aria-label={item.label}
                sx={{ width: '100%', height: '100%' }}
              >
                {item.icon}
              </ButtonBase>
            </Grow>
          ))}
        </Box>
      </Box>
    </Box>
  );
}