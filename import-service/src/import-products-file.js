import * as AWS from 'aws-sdk';
import allowedOrigins from './constants/alloweb-origins';
const { IMPORT_BUCKET_NAME, REGION } = process.env;

export const importProductsFile = async (event) => {
  console.log('Lambda invocation with event: ', event);
  const catalogName = event.queryStringParameters.name;
  const catalogPath = `uploaded/${catalogName}`;
  const response = {
    statusCode: 200,
  };

  const s3 = new AWS.S3({ region: REGION });
  const params = {
    Bucket: IMPORT_BUCKET_NAME,
    Key: catalogPath,
    Expires: 60,
    ContentType: 'text/csv',
  };

  try {
    const origin = event.headers.origin;
    if (allowedOrigins.includes(origin)) {
      response.headers = {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Credentials': true,
      };
    }
    response.body = await s3.getSignedUrlPromise('putObject', params);
  } catch (err) {
    console.log(JSON.stringify(err));
    response.statusCode = 500;
  }
  return response;
};
