'use client'

import { AppBar, BottomNavigation, BottomNavigationAction, Box, Container } from "@mui/material"
import { useState } from "react"
import Home from '@mui/icons-material/Home';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';

import { ReactNode } from "react";
import MenuAppBar from "../components/MenuAppBar";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState('Home');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}>
      <MenuAppBar />

      <Box component='main' sx={{ flexGrow: 1, overflowY: 'auto'}}>
        <Container>
          {children}
        </Container>
      </Box>
      <BottomNavigation
        showLabels
        value={currentPage}
        onChange={(event, newValue) => {
          setCurrentPage(newValue);
        }}
        sx={{ height: '8rem'}}
      >
        <BottomNavigationAction sx={{pb: 2, pt: 1}} label="Calendar" icon={<CalendarMonth />} />
        <BottomNavigationAction sx={{pb: 2, pt: 1}} label="Home" icon={<Home />} />
        <BottomNavigationAction sx={{pb: 2, pt: 1}} label="Settings" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Box>
  )
}