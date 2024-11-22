require('dotenv').config();
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsCommand } = require('@aws-sdk/client-s3');
const https = require('https');
const fs = require('fs').promises;
const path = require('path');

const s3Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.STORAGE_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.STORAGE_ACCESS_KEY,
    secretAccessKey: process.env.STORAGE_SECRET_KEY,
  },
});

function testHttpRequest(url, origin) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'Origin': origin,
        'Accept': 'image/jpeg'
      }
    };

    https.get(url, options, (res) => {
      resolve({
        ok: res.statusCode >= 200 && res.statusCode < 300,
        statusCode: res.statusCode
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🔍 Starting R2 Configuration Tests\n');

  try {
    // Test 1: Connection
    console.log('Test 1: Testing R2 Connection');
    await s3Client.send(new ListObjectsCommand({
      Bucket: process.env.STORAGE_BUCKET,
      MaxKeys: 1
    }));
    console.log('✅ Connection successful\n');

    // Test 2: Testing File Type Restrictions
    console.log('Test 2: Testing File Type Restrictions');
    const testFiles = [
      { name: 'test.jpg', content: Buffer.from('fake jpg content'), type: 'image/jpeg' },
      { name: 'test.pdf', content: Buffer.from('fake pdf content'), type: 'application/pdf' },
      { name: 'dangerous.exe', content: Buffer.from('fake exe content'), type: 'application/x-msdownload' },
      { name: 'script.php', content: Buffer.from('<?php ?>'), type: 'text/plain' },
    ];

    for (const file of testFiles) {
      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: process.env.STORAGE_BUCKET,
          Key: `test/security/${file.name}`,
          Body: file.content,
          ContentType: file.type,
        }));
        console.log(`  ${file.name}: ${file.name.endsWith('.exe') || file.name.endsWith('.php') ? '❌ Warning: Unsafe file uploaded' : '✅ Upload successful'}`);
      } catch (error) {
        const isExpectedError = (file.name.endsWith('.exe') || file.name.endsWith('.php')) && 
          (error.message.includes('Access Denied') || error.message.includes('Forbidden'));
        console.log(`  ${file.name}: ${isExpectedError ? '✅ Blocked as expected' : `❌ Unexpected error: ${error.message}`}`);
      }
    }
    console.log('');

    // Test 3: Testing CORS Configuration
    console.log('Test 3: Testing CORS Configuration');
    const testOrigins = [
      'https://appractic.com',
      'https://www.appractic.com',
      'https://storage.appractic.com',
      'https://malicious-site.com'
    ];

    for (const origin of testOrigins) {
      try {
        const response = await testHttpRequest(`${process.env.STORAGE_URL}/test/security/test.jpg`, origin);
        const allowed = testOrigins.slice(0, 3).includes(origin);
        console.log(`  ${origin}: ${response.ok === allowed ? '✅' : '❌'} ${response.statusCode}`);
      } catch (error) {
        console.log(`  ${origin}: ❌ Error: ${error.message}`);
      }
    }
    console.log('');

    // Test 4: Verify Environment Variables
    console.log('Test 4: Verifying Environment Variables');
    const requiredVars = [
      'STORAGE_URL',
      'STORAGE_ENDPOINT',
      'STORAGE_PORT',
      'STORAGE_USE_SSL',
      'STORAGE_BUCKET',
      'STORAGE_REGION',
      'STORAGE_ACCESS_KEY',
      'STORAGE_SECRET_KEY'
    ];

    for (const varName of requiredVars) {
      if (process.env[varName]) {
        console.log(`  ${varName}: ✅ Set`);
      } else {
        console.log(`  ${varName}: ❌ Missing`);
      }
    }

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.$metadata) {
      console.error('HTTP Status:', error.$metadata.httpStatusCode);
    }
  }
}

runTests();
