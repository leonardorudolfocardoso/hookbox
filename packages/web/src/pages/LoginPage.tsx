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
import { signIn } from "../lib/cognito";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn({ email, password });
      window.location.href = "/";
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sign in. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Box w="full" maxW="md" p={8}>
        <Heading size="2xl" mb={2} textAlign="center">
          Sign In
        </Heading>
        <Text color="fg.muted" mb={8} textAlign="center">
          Access your Hookbox account
        </Text>

        <form onSubmit={handleSubmit}>
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
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Field.Root>

            {error && (
              <Text color="red.500" fontSize="sm">
                {error}
              </Text>
            )}

            <Button type="submit" colorPalette="blue" loading={loading} w="full">
              Sign In
            </Button>
          </Stack>
        </form>

        <Text mt={6} textAlign="center" fontSize="sm">
          Don&apos;t have an account?{" "}
          <Link asChild colorPalette="blue">
            <RouterLink to="/signup">Sign Up</RouterLink>
          </Link>
        </Text>
      </Box>
    </Box>
  );
}
