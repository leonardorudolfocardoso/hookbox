const API_URL = import.meta.env.VITE_API_URL;

export interface Endpoint {
  id: string;
  userId: string;
  token: string;
  createdAt: string;
}

async function request(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { message?: string };
    throw new Error(body.message ?? `Request failed (${res.status})`);
  }

  return res;
}

export async function createEndpoint(token: string): Promise<Endpoint> {
  const res = await request("/endpoints", token, { method: "POST" });
  return res.json() as Promise<Endpoint>;
}

export async function listEndpoints(
  token: string,
): Promise<Endpoint[]> {
  const res = await request("/endpoints", token);
  const data = (await res.json()) as { endpoints: Endpoint[] };
  return data.endpoints;
}

export async function deleteEndpoint(
  token: string,
  id: string,
): Promise<void> {
  await request(`/endpoints/${id}`, token, { method: "DELETE" });
}

export interface EndpointRequest {
  id: string;
  endpointId: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  createdAt: string;
}

export async function listRequests(
  token: string,
  endpointId: string,
): Promise<EndpointRequest[]> {
  const res = await request(`/endpoints/${endpointId}/requests`, token);
  const data = (await res.json()) as { requests: EndpointRequest[] };
  return data.requests;
}
