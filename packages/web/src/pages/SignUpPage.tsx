import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Field,
  Heading,
  Input,
  Link,
  Stack,
  Text,
} from "@chakra-ui/react";
import { signUp, confirmSignUp } from "../lib/cognito";

export function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"register" | "confirm">("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await signUp({ email, password });
      setStep("confirm");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create account. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await confirmSignUp({ email, code });
      navigate("/login");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box w="full" maxW="md" p={8}>
        <Heading size="2xl" mb={2} textAlign="center">
          {step === "register" ? "Sign Up" : "Confirm Email"}
        </Heading>
        <Text color="fg.muted" mb={8} textAlign="center">
          {step === "register"
            ? "Create your Hookbox account"
            : `We sent a verification code to ${email}`}
        </Text>

        {step === "register" ? (
          <form onSubmit={handleRegister}>
            <Stack gap={4}>
              <Field.Root>
                <Field.Label>Email</Field.Label>
                <Input
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Password</Field.Label>
                <Input
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>Confirm Password</Field.Label>
                <Input
                  type="password"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </Field.Root>

              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                colorPalette="blue"
                loading={loading}
                w="full"
              >
                Sign Up
              </Button>
            </Stack>
          </form>
        ) : (
          <form onSubmit={handleConfirm}>
            <Stack gap={4}>
              <Field.Root>
                <Field.Label>Verification Code</Field.Label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  autoFocus
                />
              </Field.Root>

              {error && (
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              )}

              <Button
                type="submit"
                colorPalette="blue"
                loading={loading}
                w="full"
              >
                Confirm
              </Button>
            </Stack>
          </form>
        )}

        <Text mt={6} textAlign="center" fontSize="sm">
          Already have an account?{" "}
          <Link asChild colorPalette="blue">
            <RouterLink to="/login">Sign In</RouterLink>
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
