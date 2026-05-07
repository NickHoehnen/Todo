'use client'

import { Box, Button, Stack, Typography, Alert, CircularProgress, Paper } from "@mui/material";
import { applyActionCode, sendEmailVerification } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

export default function EmailStatus() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState("Awaiting verification...");
  const [severity, setSeverity] = useState<"info" | "success" | "error">("info");
  const [isVerifying, setIsVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResendEmail = async () => {
    if (!auth.currentUser) return;
    setResending(true);
    try {
      const actionCodeSettings = {
        url: 'https://todoappbackend1--todoapp-c1bf4.us-east5.hosted.app/dashboard',
        handleCodeInApp: true,
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      setSeverity("info");
      setStatus("New link sent! Please check your inbox.");
    } catch (err) {
      console.error(err);
      setSeverity("error");
      setStatus("Failed to resend email. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    const actionCode = searchParams.get('oobCode');

    if (actionCode) {
      setIsVerifying(true);
      setStatus("Verifying your email...");
      setSeverity("info");
      
      applyActionCode(auth, actionCode)
        .then(() => {
          setSeverity("success");
          setStatus("Verification successful! Redirecting to dashboard...");
          setTimeout(() => router.replace('/dashboard'), 2000);
        })
        .catch((error) => {
          setSeverity("error");
          // Catch the ugly Firebase error and make it user-friendly
          if (error.code === 'auth/invalid-action-code') {
            setStatus("This link has expired or has already been used.");
          } else {
            setStatus(`Verification failed: ${error.message}`);
          }
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [searchParams, router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, minHeight: '20vh' }}>
      <Stack spacing={3} alignItems="center" textAlign="center">
        
        {/* Header */}
        <Box>
          <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
            Email Verification
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {severity === 'success' 
              ? "Thank you for verifying your account." 
              : "Check your email for a verification link to continue."}
          </Typography>
        </Box>

        {/* Status Alert */}
        <Alert 
          severity={severity} 
          icon={isVerifying ? <CircularProgress size={20} color="inherit" /> : undefined}
          sx={{ 
            width: '100%', 
            alignItems: 'center', 
            textAlign: 'left',
            '& .MuiAlert-message': { width: '100%' } 
          }}
        >
          {status}
        </Alert>

        {/* Resend Action */}
        {severity !== 'success' && (
          <Button 
            variant="text" 
            color="primary" 
            disabled={resending || isVerifying} 
            onClick={handleResendEmail}
            sx={{ textTransform: 'none', fontWeight: 'bold' }}
          >
            {resending ? "Sending..." : "Resend Verification Email"}
          </Button>
        )}

      </Stack> 
    </Box>
  );
}