export interface Request {
  id: string;
  endpointId: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  createdAt: string;
}
