require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');

// Print current environment variables
console.log('Current configuration:');
console.log('STORAGE_ENDPOINT:', process.env.STORAGE_ENDPOINT);
console.log('STORAGE_BUCKET:', process.env.STORAGE_BUCKET);
console.log('STORAGE_URL:', process.env.STORAGE_URL);
console.log('STORAGE_ACCESS_KEY:', process.env.STORAGE_ACCESS_KEY ? '***' : 'not set');
console.log('STORAGE_SECRET_KEY:', process.env.STORAGE_SECRET_KEY ? '***' : 'not set');
console.log('STORAGE_REGION:', process.env.STORAGE_REGION);
console.log('STORAGE_PORT:', process.env.STORAGE_PORT);
console.log('STORAGE_USE_SSL:', process.env.STORAGE_USE_SSL);
console.log('\n');

// R2 configuration
const s3Client = new S3Client({
  region: process.env.STORAGE_REGION || 'auto',
  endpoint: `https://${process.env.STORAGE_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
});

async function testStorage() {
  try {
    // Create a test file
    const testContent = 'Hello from Spark-It!';
    const testKey = 'test/storage-test.txt';
    
    // Upload test file
    console.log('Uploading test file...');
    await s3Client.send(new PutObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    }));
    
    console.log('Upload successful!');
    console.log(`File should be accessible at: ${process.env.STORAGE_URL}/${testKey}`);
    
    // Try to get the object to verify upload
    console.log('\nVerifying upload...');
    const getResult = await s3Client.send(new GetObjectCommand({
      Bucket: process.env.STORAGE_BUCKET,
      Key: testKey,
    }));
    
    const streamToString = (stream) =>
      new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('error', reject);
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      });
    
    const downloadedContent = await streamToString(getResult.Body);
    console.log('Downloaded content:', downloadedContent);
    
    if (downloadedContent === testContent) {
      console.log('\nStorage test passed! ');
      console.log('Your R2 storage is configured correctly.');
    }
    
  } catch (error) {
    console.error('\nStorage test failed! ');
    console.error('Error:', error.message);
    if (error.$metadata) {
      console.error('HTTP Status:', error.$metadata.httpStatusCode);
    }
    console.error('\nPlease verify these environment variables are set correctly:');
    console.log('STORAGE_ENDPOINT:', process.env.STORAGE_ENDPOINT);
    console.log('STORAGE_BUCKET:', process.env.STORAGE_BUCKET);
    console.log('STORAGE_URL:', process.env.STORAGE_URL);
    console.log('STORAGE_ACCESS_KEY:', process.env.STORAGE_ACCESS_KEY ? '***' : 'not set');
    console.log('STORAGE_SECRET_KEY:', process.env.STORAGE_SECRET_KEY ? '***' : 'not set');
    process.exit(1);
  }
}

testStorage();