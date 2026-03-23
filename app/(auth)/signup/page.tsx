"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { User } from "@/types/user";

import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { doc, setDoc } from "firebase/firestore";

export default function SignUpPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [signingUp, setSigningUp] = useState(false);

  // Validation form
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";

    if (!phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(phone)) {
      newErrors.phone = "Enter a valid 10-digit phone number";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSignUp = async () => {
    setErrorMsg("");

    try {
      setSigningUp(true);

      // Create the new user object
      const newUser: User = {
        firstName,
        lastName,
        email,
        phone,
      }

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), newUser);

      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Signup failed");
    } finally {
      setSigningUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    // Stop if any errors
    if (Object.keys(validationErrors).length > 0) return;

    handleSignUp();
  };

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Typography variant="h5" mb={2} px={.5} textAlign="left">
        Create new user
      </Typography>

      <TextField
        fullWidth
        label="First Name"
        margin="normal"
        variant="filled"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        error={!!errors.firstName}
        helperText={errors.firstName}
      />

      <TextField
        fullWidth
        label="Last Name"
        margin="normal"
        variant="filled"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        error={!!errors.lastName}
        helperText={errors.lastName}
      />

      <TextField
        fullWidth
        label="Phone"
        margin="normal"
        variant="filled"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        error={!!errors.phone}
        helperText={errors.phone}
      />

      <TextField
        fullWidth
        label="Email"
        type="email"
        margin="normal"
        variant="filled"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={!!errors.email}
        helperText={errors.email}
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        margin="normal"
        variant="filled"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={!!errors.password}
        helperText={errors.password}
      />

      <TextField
        fullWidth
        label="Confirm Password"
        type="password"
        margin="normal"
        variant="filled"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword}
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
        disabled={signingUp}
      >
        {signingUp ? "Signing Up..." : "Sign Up"}
      </Button>
    </Box>
  );
}