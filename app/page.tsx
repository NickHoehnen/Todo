'use client'

import { Box, Button, Stack, Typography } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <Stack gap={2} sx={{ px: 6, py: 3, border: 2, borderColor: 'divider', borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Welcome</Typography>
        <Link href='/login'><Button sx={{ width: '10rem'}} variant="contained">Login</Button></Link>
        <Link href='/signup'><Button sx={{ width: '10rem'}} variant="text">Create an account</Button></Link>
      </Stack>
    </Box>
  );
}
