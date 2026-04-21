import { Typography } from "@mui/material";
import { Suspense } from "react";
import EmailStatus from "@/app/components/EmailStatus";

// App url: https://todoappbackend1--todoapp-c1bf4.us-east5.hosted.app/dashboard

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<Typography>Loading verification details...</Typography>}>
      <EmailStatus />
    </Suspense>
  )
}