"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();

  // Unified form state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // formData reflects current form state
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear field-specific error when user types
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      await userCredential.user.reload();
      if(!userCredential.user.emailVerified) {
        setErrorMsg("Please verify your account by using the link sent to your email before logging in");
        router.push('verify-email')
        return;
      }
      router.push("/dashboard");
    } catch (err: any) {
      // Friendly messages for common Firebase Auth errors
      switch (err.code) {
        case "auth/invalid-credential":
          setErrorMsg("Invalid email or password. Please try again.");
          break;
        case "auth/user-not-found":
          setErrorMsg("No account found with this email.");
          break;
        case "auth/too-many-requests":
          setErrorMsg("Too many failed attempts. Please try again later.");
          break;
        default:
          setErrorMsg("An error occurred during login. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" mb={2} fontWeight="bold">
        Login
      </Typography>

      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        variant="filled"
        margin="normal"
        value={formData.email}
        onChange={handleFormChange}
        error={!!errors.email}
        helperText={errors.email}
      />

      <TextField
        fullWidth
        label="Password"
        name="password"
        type="password"
        variant="filled"
        margin="normal"
        value={formData.password}
        onChange={handleFormChange}
        error={!!errors.password}
        helperText={errors.password}
      />

      {errorMsg && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {errorMsg}
        </Alert>
      )}

      <Button
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 3, py: 1.5 }}
        type="submit"
        disabled={loading}
        startIcon={loading && <CircularProgress size={20} color="inherit" />}
      >
        {loading ? "Logging in..." : "Login"}
      </Button>

      <Link href='/signup'>
        <Typography color="primary" align="center" mt={2}>Don't have an account? Sign up</Typography>
      </Link>
    </Box>
  );
}