import AWS from "aws-sdk";

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
});

export async function uploadToS3(buffer, key, mime) {
  return s3.upload({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: mime,
  }).promise();
}

