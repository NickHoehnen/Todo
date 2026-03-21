'use client'

import { Container } from "@mui/material"

export default function ProtectedLayout(
  { children }:
  { children: React.ReactElement}
) {
  return (
    <Container>
      {children}
    </Container>
  )
}