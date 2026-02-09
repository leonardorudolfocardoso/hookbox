import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  QueryCommand,
  GetCommand,
  DynamoDBDocumentClient,
} from "@aws-sdk/lib-dynamodb";
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

  const endpointId = event.pathParameters?.id;
  if (!endpointId) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing endpoint id" }),
    };
  }

  // Verify the endpoint belongs to the authenticated user
  const endpoint = await client.send(
    new GetCommand({
      TableName: Resource.Endpoints.name,
      Key: { id: endpointId },
    }),
  );

  if (!endpoint.Item) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Endpoint not found" }),
    };
  }

  if (endpoint.Item.userId !== userId) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Forbidden" }),
    };
  }

  const result = await client.send(
    new QueryCommand({
      TableName: Resource.Requests.name,
      IndexName: "byEndpointId",
      KeyConditionExpression: "endpointId = :endpointId",
      ExpressionAttributeValues: {
        ":endpointId": endpointId,
      },
    }),
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requests: result.Items ?? [] }),
  };
}
