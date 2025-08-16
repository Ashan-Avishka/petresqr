// src/config/aws.ts
import AWS from 'aws-sdk';

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

export const s3 = new AWS.S3();

export const uploadToS3 = async (
  buffer: Buffer,
  key: string,
  contentType: string
): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  };

  const result = await s3.upload(params).promise();
  return result.Location;
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  };

  await s3.deleteObject(params).promise();
};