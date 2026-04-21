'use client'
import { Box, Button, Stack, Typography } from "@mui/material";
import { applyActionCode, sendEmailVerification } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

export default function EmailStatus() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Awaiting verification");
  const [messageColor, setMessageColor] = useState({ text: 'warning.dark', background: 'warning.light'});
  const [threeDots, setThreeDots] = useState("...");
  const [resending, setResending] = useState(false);
  const router = useRouter();

  // Optimized animation: remove threeDots from dependency to avoid resetting interval
  useEffect(() => {    
    const interval = setInterval(() => {
      setThreeDots(prev => prev === "..." ? "." : prev + ".");
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleResendEmail = async () => {
    if(!auth.currentUser) return;
    setResending(true);
    try {
      const actionCodeSettings = {
        // Updated to your hosted URL for production readiness
        url: 'https://todoappbackend1--todoapp-c1bf4.us-east5.hosted.app/dashboard',
        handleCodeInApp: true,
      };
      await sendEmailVerification(auth.currentUser, actionCodeSettings);
      setStatus("New link sent! Please check your inbox.");
    } catch (err) {
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  useEffect(() => {
    const actionCode = searchParams.get('oobCode');

    if (actionCode) {
      applyActionCode(auth, actionCode)
        .then(() => {
          setMessageColor({ text: 'success.dark', background: 'success.light'});
          setStatus("Verification successful! Redirecting...");
          setTimeout(() => router.replace('/dashboard'), 2000);
        })
        .catch((error) => {
          setMessageColor({ text: 'error.dark', background: 'error.light'});
          setStatus(`Verification failed: ${error.message}`);
        });
    }
  }, [searchParams, router]);

  return (
    <Stack spacing={1.5}>
      <Typography variant="h4" align="center">Verify Email</Typography>
      <Typography variant="body1" align="center">Check your email for a verification link</Typography>

      <Typography 
        variant="overline" 
        align="center" 
        color={messageColor.text}
        sx={{ 
          backgroundColor: messageColor.background, 
          borderRadius: 2,
          display: 'flex',
          justifyContent: 'center',
          minHeight: '30px',
          px: 2
        }}
      >
        {status}
        {status === "Awaiting verification" && (
          <Box sx={{ width: '1.5em', textAlign: 'left', ml: .2 }}>
            {threeDots}
          </Box>
        )}
      </Typography>

      <Button variant="text" disabled={resending} onClick={handleResendEmail}>
        {resending ? "Sending..." : "Resend Email"}
      </Button>
    </Stack>
  );
}