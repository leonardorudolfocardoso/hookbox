import crypto from "node:crypto";
import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  QueryCommand,
  PutCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
import type { APIGatewayProxyEventV2 } from "aws-lambda";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function handler(event: APIGatewayProxyEventV2) {
  const token = event.pathParameters?.token;
  if (!token) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing token" }),
    };
  }

  // Look up the endpoint by token
  const endpointResult = await client.send(
    new QueryCommand({
      TableName: Resource.Endpoints.name,
      IndexName: "byToken",
      KeyConditionExpression: "#token = :token",
      ExpressionAttributeNames: { "#token": "token" },
      ExpressionAttributeValues: { ":token": token },
    }),
  );

  const endpoint = endpointResult.Items?.[0];
  if (!endpoint) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Endpoint not found" }),
    };
  }

  const headers: Record<string, string> = {};
  if (event.headers) {
    for (const [key, value] of Object.entries(event.headers)) {
      if (value !== undefined) {
        headers[key] = value;
      }
    }
  }

  const request = {
    id: crypto.randomUUID(),
    endpointId: endpoint.id as string,
    headers,
    body: event.body ?? "",
    createdAt: new Date().toISOString(),
  };

  await client.send(
    new PutCommand({
      TableName: Resource.Requests.name,
      Item: request,
    }),
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "OK" }),
  };
}
