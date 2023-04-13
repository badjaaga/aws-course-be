import middy from "@middy/core";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export const logger = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => ({
  before: async (request) => {
    console.log("Incoming request", JSON.stringify(request.event));
  },
});
