import { Resource } from "sst";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { PostConfirmationTriggerEvent } from "aws-lambda";

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

export async function handler(event: PostConfirmationTriggerEvent) {
  const { sub, email } = event.request.userAttributes;

  await client.send(
    new PutCommand({
      TableName: Resource.Users.name,
      Item: {
        id: sub,
        email,
        createdAt: new Date().toISOString(),
      },
    }),
  );

  return event;
}
