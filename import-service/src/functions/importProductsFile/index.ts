import AWS from "aws-sdk";
import { middyfy } from "@libs/lambda";
import { errorResponse, successResponse } from "@libs/api-gateway";
import { BUCKET_NAME, FolderName, REGION } from "src/constants";

const importProductsFileFunction = async (event) => {
  try {
    const name = event.queryStringParameters.name;

    if (!name) {
      return errorResponse({
        statusCode: 403,
        message: 'Missing query "name" in the path',
      });
    }

    const s3 = new AWS.S3({ region: REGION });
    const params = {
      Bucket: BUCKET_NAME,
      Key: `${FolderName.UPLOADED}/${name}`,
      Expires: 60,
      ContentType: "text/csv",
    };

    const url = s3.getSignedUrl("putObject", params);

    if (!url) {
      throw new Error("Error get url");
    }

    return successResponse({ url });
  } catch (err) {
    return errorResponse(err);
  }
};

export const importProductsFile = middyfy(importProductsFileFunction);
