"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
//import { signInWithEmailAndPassword } from "firebase/auth";
//import { auth } from "@/lib/firebase"; // adjust path as needed

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleLogin = async () => {
    setErrorMsg("");

    // Validate and set errors first
    const validationErrors = validate();
    setErrors(validationErrors);
    if(Object.keys(validationErrors).length > 0) return;

    // No errors, attempt sign in
    try {
      setLoggingIn(true);
      //await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Login failed");
      setLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" mb={2} px={.5} textAlign="left">
        Login
      </Typography>

      <TextField
        fullWidth
        label="Email"
        type="email"
        variant="filled"
        margin="normal"
        error={!!errors.email}
        helperText={errors.email}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        variant="filled"
        margin="normal"
        error={!!errors.password}
        helperText={errors.password}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {errorMsg && (
        <Typography color="error" mt={1} fontSize={14}>
          {errorMsg}
        </Typography>
      )}

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 3 }}
        type="submit"
      >
        {loggingIn ? "Logging in..." : "LogIn"}
      </Button>
    </Box>
  );
}