'use client'

import { BottomNavigation, BottomNavigationAction, Container } from "@mui/material"
import { useState } from "react"
import Home from '@mui/icons-material/Home';
import CalendarMonth from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';

import { ReactNode } from "react";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  const [currentPage, setCurrentPage] = useState('Home');

  return (
    <>
      <BottomNavigation
        showLabels
        value={currentPage}
        onChange={(event, newValue) => {
          setCurrentPage(newValue);
        }}
      >
        <BottomNavigationAction label="Calendar" icon={<CalendarMonth />} />
        <BottomNavigationAction label="Home" icon={<Home />} />
        <BottomNavigationAction label="Settings" icon={<SettingsIcon />} />
      </BottomNavigation>
      <Container>
        {children}
      </Container>
    </>
  )
}