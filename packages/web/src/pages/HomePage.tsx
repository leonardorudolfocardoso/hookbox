import { Box, Button, Heading, Text, Stack } from "@chakra-ui/react";
import { useAuth } from "../lib/auth-context";

export function HomePage() {
  const { signOut } = useAuth();

  return (
    <Box minH="100vh" display="flex" alignItems="center" justifyContent="center">
      <Stack gap={4} align="center">
        <Heading size="2xl">Hookbox</Heading>
        <Text color="fg.muted">Welcome! You are signed in.</Text>
        <Button variant="outline" onClick={signOut}>
          Sign Out
        </Button>
      </Stack>
    </Box>
  );
}
