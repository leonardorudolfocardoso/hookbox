import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
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

  const result = await client.send(
    new QueryCommand({
      TableName: Resource.Endpoints.name,
      IndexName: "byUserId",
      KeyConditionExpression: "userId = :userId",
      ExpressionAttributeValues: { ":userId": userId },
    }),
  );

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoints: result.Items ?? [] }),
  };
}
