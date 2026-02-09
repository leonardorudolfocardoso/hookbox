import crypto from "node:crypto";
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { getUserId, UnauthorizedError } from "./lib/auth.js";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function handler(event: APIGatewayProxyEventV2) {
  let userId: string;
  try {
    userId = getUserId(event);
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return {
        statusCode: 401,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: err.message }),
      };
    }
    throw err;
  }

  const endpoint = {
    id: crypto.randomUUID(),
    userId,
    token: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  await client.send(
    new PutCommand({
      TableName: Resource.Endpoints.name,
      Item: endpoint,
    }),
  );

  return {
    statusCode: 201,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(endpoint),
  };
}
