'use client'

import { Box, Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, justifyContent: 'center', height: '100%', width: '100%'}}>
      <Link href='/login'><Button sx={{ width: '10rem'}} variant="contained">Login</Button></Link>
      <Link href='/signup'><Button sx={{ width: '10rem'}} variant="text">Create an account</Button></Link>
    </Box>
  );
}
