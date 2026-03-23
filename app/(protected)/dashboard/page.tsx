'use client'

import { Box, Button, Container, Stack, Typography } from "@mui/material";



export default function Dashboard() {
  return (
    <Stack spacing={10}>
      {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(num => {
        return (
          <Box key={num} sx={{border: '2px solid white', width: '10rem'}}>{num}</Box>
        )
      })}
    </Stack>
  )
}