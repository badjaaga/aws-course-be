class s3ObjectService {
  async copyObject(
    s3: any,
    params: {
      bucketName: string;
      objectKey: string;
      prefixOld: string;
      prefixNew: string;
    }
  ) {
    try {
      const { bucketName, objectKey, prefixOld, prefixNew } = params;
      await s3
        .copyObject({
          Bucket: bucketName,
          CopySource: `${bucketName}/${objectKey}`,
          Key: objectKey.replace(prefixOld, prefixNew),
        })
        .promise();
      console.log(" -- copyObject success:", objectKey);
    } catch (err) {
      console.log("Error copyObject: ", err);
      throw new Error(err);
    }
  }

  async deleteObject(
    s3: any,
    params: { bucketName: string; objectKey: string }
  ) {
    try {
      const { bucketName, objectKey } = params;
      await s3
        .deleteObject({
          Bucket: bucketName,
          Key: objectKey,
        })
        .promise();
      console.log(" -- deleteObject success:", objectKey);
    } catch (err) {
      console.log("Error deleteObject: ", err);
      throw new Error(err);
    }
  }
}

export default new s3ObjectService();
