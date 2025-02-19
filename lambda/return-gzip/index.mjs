import { gzipSync } from 'zlib';
import {readFileSync} from 'fs';

export const handler = async (event) => {
    console.log(`> handler`);
    
    const data = readFileSync('./data.json', 'utf-8');
        
    // Compresses data using gzip and encodes to base64
    const compressedData = gzipSync(data).toString('base64');

    // console.log(`data.length=${data.length}`);
    // console.log(`compressedData.length=${compressedData.length}`);

    const response = {
        isBase64Encoded: true,
        headers: {
            'content-type': 'application/json',
            'content-encoding': 'gzip'
        },
        statusCode: 200,
        body: compressedData
    };
    
    return response;
};

