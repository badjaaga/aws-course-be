import * as AWS from 'aws-sdk';
import * as csv from 'csv-parser';
const { IMPORT_BUCKET_NAME, REGION, SQS_URL } = process.env;

export const importFileParser = async (event) => {
  console.log('Lambda invocation with event: ', event);
  const s3 = new AWS.S3({ region: REGION });
  const sqs = new AWS.SQS({ region: REGION });

  const processRecord = async (record) => {
    return new Promise((resolve, reject) => {
      s3.getObject({
        Bucket: IMPORT_BUCKET_NAME,
        Key: record.s3.object.key,
      })
        .createReadStream()
        .pipe(csv())
        .on('error', (error) => {
          console.log('Read stream error: ', JSON.stringify(error));
          reject(error);
        })
        .on('data', async (data) => {
          console.log('Product record data', JSON.stringify(data));
          try {
            const params = {
              QueueUrl: SQS_URL,
              MessageBody: JSON.stringify(data),
            };
            const resp = await sqs.sendMessage(params).promise();
          } catch (err) {
            console.log(err);
          }
        })
        .on('end', async () => {
          const copySource = `${IMPORT_BUCKET_NAME}/${record.s3.object.key}`;
          const targetKey = record.s3.object.key.replace('uploaded', 'parsed');
          console.log(`Copy from ${copySource}`);

          try {
            await s3
              .copyObject({
                Bucket: IMPORT_BUCKET_NAME,
                CopySource: copySource,
                Key: targetKey,
              })
              .promise();

            console.log(`Copied into ${IMPORT_BUCKET_NAME}/${targetKey}`);

            await s3
              .deleteObject({
                Bucket: IMPORT_BUCKET_NAME,
                Key: record.s3.object.key,
              })
              .promise();

            console.log(`Deleted from ${copySource}`);
          } catch (err) {
            console.log(JSON.stringify(err));
          }

          resolve();
        });
    });
  };

  await Promise.all(event.Records.map((record) => processRecord(record)));
};
