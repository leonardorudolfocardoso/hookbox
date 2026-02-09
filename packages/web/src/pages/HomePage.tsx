import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  Code,
  Dialog,
  Heading,
  HStack,
  Spinner,
  Table,
  Text,
  Link,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import {
  createEndpoint,
  listEndpoints,
  deleteEndpoint,
} from "../lib/api";
import type { Endpoint } from "../lib/api";

export function HomePage() {
  const { getToken, signOut } = useAuth();
  const [endpoints, setEndpoints] = useState<Endpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");

  const fetchEndpoints = useCallback(async () => {
    try {
      const token = await getToken();
      const data = await listEndpoints(token);
      data.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setEndpoints(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load endpoints",
      );
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    void fetchEndpoints();
  }, [fetchEndpoints]);

  async function handleCreate() {
    setCreating(true);
    setError("");
    try {
      const token = await getToken();
      const created = await createEndpoint(token);
      setEndpoints((prev) => [created, ...prev]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create endpoint",
      );
    } finally {
      setCreating(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === endpoints.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(endpoints.map((e) => e.id)));
    }
  }

  async function handleDeleteConfirmed() {
    setDeleting(true);
    setError("");
    try {
      const token = await getToken();
      await Promise.all(
        [...selected].map((id) => deleteEndpoint(token, id)),
      );
      setEndpoints((prev) => prev.filter((e) => !selected.has(e.id)));
      setSelected(new Set());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete endpoints",
      );
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  function formatDateTime(iso: string) {
    return new Date(iso).toLocaleString();
  }

  return (
    <Box maxW="5xl" mx="auto" p={8}>
      <HStack justify="space-between" mb={8}>
        <Heading size="xl">Endpoints</Heading>
        <HStack gap={2}>
          {selected.size > 0 && (
            <Button
              colorPalette="red"
              variant="outline"
              onClick={() => setConfirmOpen(true)}
            >
              Delete ({selected.size})
            </Button>
          )}
          <Button
            colorPalette="blue"
            onClick={handleCreate}
            loading={creating}
          >
            New Endpoint
          </Button>
          <Button variant="outline" onClick={signOut}>
            Sign Out
          </Button>
        </HStack>
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
      ) : endpoints.length === 0 ? (
        <Box textAlign="center" py={16}>
          <Text color="fg.muted" fontSize="lg">
            No endpoints yet. Create one to get started.
          </Text>
        </Box>
      ) : (
        <Table.Root variant="outline">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader w="0">
                <Checkbox.Root
                  checked={
                    selected.size === endpoints.length
                      ? true
                      : selected.size > 0
                        ? "indeterminate"
                        : false
                  }
                  onCheckedChange={toggleSelectAll}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control />
                </Checkbox.Root>
              </Table.ColumnHeader>
              <Table.ColumnHeader>ID</Table.ColumnHeader>
              <Table.ColumnHeader>Token</Table.ColumnHeader>
              <Table.ColumnHeader>Created</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {endpoints.map((endpoint) => (
              <Table.Row key={endpoint.id}>
                <Table.Cell>
                  <Checkbox.Root
                    checked={selected.has(endpoint.id)}
                    onCheckedChange={() => toggleSelect(endpoint.id)}
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                  </Checkbox.Root>
                </Table.Cell>
                <Table.Cell>
                  <Link asChild colorPalette="blue">
                    <RouterLink to={`/endpoints/${endpoint.id}`}>
                      <Code>{endpoint.id.slice(0, 8)}</Code>
                    </RouterLink>
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Code>{endpoint.token}</Code>
                </Table.Cell>
                <Table.Cell>{formatDateTime(endpoint.createdAt)}</Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      <Dialog.Root
        open={confirmOpen}
        onOpenChange={(e) => setConfirmOpen(e.open)}
        role="alertdialog"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Confirm Deletion</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Text>
                Are you sure you want to delete{" "}
                {selected.size === 1
                  ? "this endpoint"
                  : `these ${selected.size} endpoints`}
                ? This action cannot be undone.
              </Text>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.CloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </Dialog.CloseTrigger>
              <Button
                colorPalette="red"
                onClick={handleDeleteConfirmed}
                loading={deleting}
              >
                Delete
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}
