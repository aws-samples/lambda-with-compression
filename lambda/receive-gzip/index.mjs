import {gunzipSync} from 'zlib';

export const handler = async (event) => {
    console.log(`> handler isbase64Encoded=${event.isBase64Encoded}`);

    const responseBody = {
        isBase64Encoded: event.isBase64Encoded,
    };

    const requestBody = event.body;
    responseBody.requestBodyLength = requestBody.length;

    if (event.isBase64Encoded){
        const decoded = Buffer.from(requestBody, 'base64');
        const decompressed = gunzipSync(decoded).toString('utf-8');
        responseBody.decompressedBodyLength = decompressed.length;
    }

    return {
        statusCode: 200,
        body: JSON.stringify(responseBody),
    };
}
