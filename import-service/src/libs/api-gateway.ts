import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import type { FromSchema } from "json-schema-to-ts";

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, "body"> & {
  body: FromSchema<S>;
};
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
  ValidatedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

type ResponseError = {
  message: string;
  description?: string;
};

export const defaultHeaders = {
  "Access-Control-Allow-Methods": "*",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
};

export const successResponse = <T>(response: T) => {
  return {
    statusCode: 200,
    headers: {
      ...defaultHeaders,
    },
    body: JSON.stringify(response),
  };
};

export const errorResponse = (err) => {
  const response: ResponseError = {
    message: err.message || "Something went wrong",
  };

  if (err.description) {
    response.description = err.description;
  }

  return {
    statusCode: err.statusCode || 500,
    headers: {
      ...defaultHeaders,
    },
    body: JSON.stringify(response),
  };
};
