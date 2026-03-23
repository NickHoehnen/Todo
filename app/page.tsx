'use client'

import { Button } from "@mui/material";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col gap-5 p-4 items-center justify-center h-screen">
      <Link href='/login'><Button variant="contained">Login</Button></Link>
      <Link href='/signup'><Button variant="text">Create an account</Button></Link>
    </div>
  );
}
