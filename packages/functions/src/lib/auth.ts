import type { APIGatewayProxyEventV2 } from "aws-lambda";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Extract the user ID (Cognito `sub`) from the Authorization header JWT.
 *
 * Always decodes the token directly from the header, regardless of
 * environment. The API Gateway JWT authorizer handles validation in
 * deployed mode — this function only extracts the `sub` claim.
 *
 * @throws {UnauthorizedError} if no valid user ID can be extracted.
 */
export function getUserId(event: APIGatewayProxyEventV2): string {
  const header = event.headers?.authorization ?? event.headers?.Authorization;
  if (!header) throw new UnauthorizedError();

  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  const payloadPart = token.split(".")[1];
  if (!payloadPart) throw new UnauthorizedError();

  try {
    const payload = JSON.parse(
      Buffer.from(payloadPart, "base64url").toString(),
    ) as { sub?: string };
    if (!payload.sub) throw new UnauthorizedError();
    return payload.sub;
  } catch (err) {
    if (err instanceof UnauthorizedError) throw err;
    throw new UnauthorizedError();
  }
}
