export interface Request {
  id: string;
  endpointId: string;
  headers: Record<string, string>;
  body: string;
  createdAt: string;
}
