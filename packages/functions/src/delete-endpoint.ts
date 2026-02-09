import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  GetCommand,
  DeleteCommand,
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

  const id = event.pathParameters?.id;
  if (!id) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Missing endpoint id" }),
    };
  }

  const result = await client.send(
    new GetCommand({
      TableName: Resource.Endpoints.name,
      Key: { id },
    }),
  );

  if (!result.Item) {
    return {
      statusCode: 404,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Endpoint not found" }),
    };
  }

  if (result.Item.userId !== userId) {
    return {
      statusCode: 403,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: "Forbidden" }),
    };
  }

  await client.send(
    new DeleteCommand({
      TableName: Resource.Endpoints.name,
      Key: { id },
    }),
  );

  return { statusCode: 204 };
}
