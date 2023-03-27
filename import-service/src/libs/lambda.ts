import middy from "@middy/core";
import middyJsonBodyParser from "@middy/http-json-body-parser";
import { logger } from "./logger";

export const middyfy = (handler) => {
  return middy(handler).use(logger()).use(middyJsonBodyParser());
};
