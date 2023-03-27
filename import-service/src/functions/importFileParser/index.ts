import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import { BUCKET_NAME, FolderName, REGION } from "src/constants";
import { asStream } from "src/types";
import s3ObjectService from "src/services/s3ObjectService";
import AWS from "aws-sdk";

export const importFileParser = async (event) => {
  const client = new S3Client({ region: REGION });
  const s3 = new AWS.S3({ region: REGION });

  console.log(" -- event.Records", JSON.stringify(event.Records));

  try {
    for await (const record of event.Records) {
      const { name } = record.s3.bucket;
      const { key }: { key: string } = record.s3.object;

      // Read file
      const response = await client.send(
        new GetObjectCommand({
          Bucket: name,
          Key: key,
        })
      );

      // Parsing records
      const stream = asStream(response).pipe(csvParser({}));

      for await (const record of stream) {
        console.log(" -- Product: ", record);
      }

      await s3ObjectService.copyObject(s3, {
        bucketName: BUCKET_NAME,
        objectKey: key,
        prefixOld: FolderName.UPLOADED,
        prefixNew: FolderName.PARSED,
      });

      await s3ObjectService.deleteObject(s3, {
        bucketName: BUCKET_NAME,
        objectKey: key,
      });
    }
  } catch (err) {
    console.log(` -- Error importFileParser: ${err} `);
  }
};
