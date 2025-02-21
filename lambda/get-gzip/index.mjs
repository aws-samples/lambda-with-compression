import { gzipSync } from 'zlib';
import {readFileSync} from 'fs';

export const handler = async (event) => {
    console.log(`> handler`);
    
    const DESIRED_PAYLOAD_SIZE_MB = 1;

    const filecontent = readFileSync('./data.json', 'utf-8');
    const parsed = JSON.parse(filecontent);
    const bigarray = [];
    for (let i=0; i<DESIRED_PAYLOAD_SIZE_MB; i++){
        for (let obj of parsed){
            bigarray.push(obj);
        }    
    }
    const data = JSON.stringify(bigarray, null, 2);

    // Compresses data using gzip and encodes to base64
    const compressedData = gzipSync(data).toString('base64');

    console.log(`data.length=${data.length}`);
    console.log(`compressedData.length=${compressedData.length}`);

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

