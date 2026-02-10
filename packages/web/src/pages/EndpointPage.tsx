import { useState, useEffect, useCallback } from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Code,
  Heading,
  HStack,
  Link,
  Spinner,
  Table,
  Text,
} from "@chakra-ui/react";
import { useAuth } from "../lib/auth-context";
import { listRequests } from "../lib/api";
import type { EndpointRequest } from "../lib/api";
import { CopyButton } from "../components/CopyButton";

export function EndpointPage() {
  const { id } = useParams<{ id: string }>();
  const { getToken } = useAuth();
  const [requests, setRequests] = useState<EndpointRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRequests = useCallback(async () => {
    if (!id) return;
    try {
      const token = await getToken();
      const data = await listRequests(token, id);
      data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setRequests(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load requests",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken, id]);

  useEffect(() => {
    void fetchRequests();
  }, [fetchRequests]);

  return (
    <Box maxW="5xl" mx="auto" p={8}>
      <Link asChild colorPalette="blue" mb={4} display="inline-block">
        <RouterLink to="/">← Back to Endpoints</RouterLink>
      </Link>

      <HStack justify="space-between" mb={8}>
        <Heading size="xl">
          Endpoint <Code fontSize="xl">{id?.slice(0, 8)}</Code>
        </Heading>
      </HStack>

      {error && (
        <Text color="red.500" mb={4}>
          {error}
        </Text>
      )}

      {loading ? (
        <Box textAlign="center" py={16}>
          <Spinner size="lg" />
        </Box>
      ) : requests.length === 0 ? (
        <Box textAlign="center" py={16}>
          <Text color="fg.muted" fontSize="lg">
            No requests yet. Send a webhook to this endpoint to see it here.
          </Text>
        </Box>
      ) : (
        <Table.Root variant="outline">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Body</Table.ColumnHeader>
              <Table.ColumnHeader>Received</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {requests.map((req) => (
              <Table.Row key={req.id}>
                <Table.Cell maxW="md" overflow="hidden" textOverflow="ellipsis" whiteSpace="nowrap">
                  {req.body ? (
                    <CopyButton value={req.body} label="Copy request body">
                      <Code>{req.body}</Code>
                    </CopyButton>
                  ) : (
                    <Code>—</Code>
                  )}
                </Table.Cell>
                <Table.Cell>
                  {new Date(req.createdAt).toLocaleString()}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}
    </Box>
  );
}
