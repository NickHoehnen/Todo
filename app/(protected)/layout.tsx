'use client'

import { BottomNavigation, BottomNavigationAction, Box, ButtonBase, CircularProgress, Container, Paper, Typography } from "@mui/material"
import { usePathname, useRouter } from "next/navigation" // Import this
import Home from '@mui/icons-material/Home';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import { ReactNode, useEffect } from "react";
import MenuAppBar from "../components/MenuAppBar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CalendarMonthOutlined, HomeOutlined } from "@mui/icons-material";

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
          bgcolor: 'background.paper'
        }}
      >
        <Container>{children}</Container>
      </Box>

      {/* Navigation area */}
      <Box sx={{ pb: 'calc(env(safe-area-inset-bottom)/2)'}}>
        <BottomNavigation
          //showLabels
          value={rootPath}
          sx={(theme) => ({
            width: '100%',
            flexShrink: 0,
            height: `4rem`,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.default',
            justifyContent: 'space-around'
          })}
        >
          {/* <BottomNavigationAction
            label="Calendar"
            value="/calendar"
            icon={<CalendarMonth />}
            component={Link}
            href="/calendar"
          />
          <BottomNavigationAction
            label="Home"
            value="/dashboard"
            icon={<Home />}
            component={Link}
            href="/dashboard"
          />
          <BottomNavigationAction
            label="Settings"
            value="/settings"
            icon={<SettingsIcon />}
            component={Link}
            href="/settings"
          /> */}
          <Box component={Link} href='calendar' sx={{ px: '1rem', display: 'flex', alignItems: 'center'}}><CalendarMonth color={rootPath === '/calendar' ? 'primary' : 'action'} /></Box>
          <Box component={Link} href='dashboard' sx={{ px: '1rem', display: 'flex', alignItems: 'center'}}><Home fontSize="large" color={rootPath === '/dashboard' ? 'primary' : 'action'} /></Box>
          <Box component={Link} href='settings' sx={{ px: '1rem', display: 'flex', alignItems: 'center'}}><SettingsIcon color={rootPath === '/settings' ? 'primary' : 'action'} /></Box>
        </BottomNavigation>
      </Box>
    </Box>
  );
}