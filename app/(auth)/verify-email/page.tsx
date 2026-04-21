'use client'
import { Box, Button, Stack, Typography } from "@mui/material";
import { applyActionCode, sendEmailVerification } from "firebase/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

// App url: https://todoappbackend1--todoapp-c1bf4.us-east5.hosted.app/dashboard

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Awaiting verification");
  const [messageColor, setMessageColor] = useState({ text: 'warning.dark', background: 'warning.light'})
  const [threeDots, setThreeDots] = useState("...");
  const [resending, setResending] = useState(false);
  const router = useRouter();

  useEffect(() => {    
    const interval = setInterval(() => {
      setThreeDots(prev => prev === "..." ? "." : prev + ".")
    }, 500);

    return () => clearInterval(interval)
  }, [threeDots]);

  const handleResendEmail = async () => {
    if(!auth.currentUser) return;
    setResending(true);
    const actionCodeSettings = {
      url: 'http://localhost:3000/verify-email',
      handleCodeInApp: true,
    }
    await sendEmailVerification(auth.currentUser, actionCodeSettings);
    setResending(false);
  }

  useEffect(() => {
    const actionCode = searchParams.get('oobCode');

    if(actionCode) {
      applyActionCode(auth, actionCode)
      .then(() => {
        setMessageColor({ text: 'success.dark', background: 'success.light'});
        setStatus("Verification successful! Redirecting...");
        setTimeout(() => router.replace('/dashboard'), 1000);
      })
      .catch((error) => {
        setMessageColor({ text: 'error.dark', background: 'error.light'});
        setStatus(`Verification failed: ${error}`);
      })
    }

  }, [searchParams, router])

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
        }}
      >
        {status}
        {status === "Awaiting verification" && (
          <Box  sx={{ width: '1.5em', textAlign: 'left', ml: 0 }}>
            {threeDots}
          </Box>
        )}
      </Typography>

      <Button variant="text" disabled={resending} onClick={handleResendEmail}>Resend Email</Button>
    </Stack>
  )
}