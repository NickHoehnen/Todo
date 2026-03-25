"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { User } from "@/types/user";
import { doc, setDoc } from "firebase/firestore";

import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import Link from "next/link";

export default function SignUpPage() {
  const router = useRouter();

  // Consolidate state for cleaner updates
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing again
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const { firstName, lastName, phone, email, password, confirmPassword } = formData;

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!/^[0-9]{10}$/.test(phone)) newErrors.phone = "Enter a valid 10-digit phone number";
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = "Enter a valid email";
    if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

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
      const { email, password, firstName, lastName, phone } = formData;

      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Prepare Firestore Document
      const userDoc: User = {
        firstName,
        lastName,
        email,
        phone,
        // Add createdAt if your User type supports it
        // createdAt: new Date().toISOString(),
      };

      // 3. Save to Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), userDoc);

      router.push("/dashboard");
    } catch (err: any) {
      // Map Firebase errors to human-readable strings
      if (err.code === "auth/email-already-in-use") {
        setErrorMsg("This email is already registered.");
      } else {
        setErrorMsg(err.message || "An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Typography variant="h5" mb={2} fontWeight="bold">
        Create new user
      </Typography>

      {/* Grouping Names */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          margin="normal"
          variant="filled"
          value={formData.firstName}
          onChange={handleChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
        <TextField
          fullWidth
          label="Last Name"
          name="lastName"
          margin="normal"
          variant="filled"
          value={formData.lastName}
          onChange={handleChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
      </Box>

      <TextField
        fullWidth
        label="Phone"
        name="phone"
        margin="normal"
        variant="filled"
        value={formData.phone}
        onChange={handleChange}
        error={!!errors.phone}
        helperText={errors.phone}
      />

      <TextField
        fullWidth
        label="Email"
        name="email"
        type="email"
        margin="normal"
        variant="filled"
        value={formData.email}
        onChange={handleChange}
        error={!!errors.email}
        helperText={errors.email}
      />

      <TextField
        fullWidth
        label="Password"
        name="password"
        type="password"
        margin="normal"
        variant="filled"
        value={formData.password}
        onChange={handleChange}
        error={!!errors.password}
        helperText={errors.password}
      />

      <TextField
        fullWidth
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        margin="normal"
        variant="filled"
        value={formData.confirmPassword}
        onChange={handleChange}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
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
      >
        {loading ? "Creating Account..." : "Sign Up"}
      </Button>

      {/* <Button 
        fullWidth 
        sx={{ mt: 1 }} 
        onClick={() => router.replace("/login")}
        disabled={loading}
        type="button"
      >
        Already have an account? Login
      </Button> */}
      <Link href='/login'>
        <Typography color="primary" align="center" mt={2}>Already have an account? Login</Typography>
      </Link>
    </Box>
  );
}