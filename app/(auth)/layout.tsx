'use client'
import { Container, Paper } from "@mui/material";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Container
      sx={(theme) => ({
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        px: 4,
        bgcolor: 'background.default',
      })}
    >
      <Paper 
        elevation={12} 
        sx={{ 
          p: 3, 
          borderRadius: 3, 
          width: '100%', 
          maxWidth: '450px',
          marginTop: '-3rem', // Push it up slightly from center
          bgcolor: 'background.paper',
          boxShadow: '-3px 3px 6px 2px theme.background.paper'
        }}
      >
        {children}
      </Paper>
    </Container>
  );
}