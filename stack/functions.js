const path = require('path');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { Duration } = require('aws-cdk-lib');

const bootstrap = (ctx) => {
    const getGzipFn = new Function(ctx, 'GetGzipFn', {
        functionName: 'compression-demo-get-gzip',
        runtime: Runtime.NODEJS_20_X,
        handler: 'index.handler',
        memorySize: 1024,
        timeout: Duration.seconds(10),
        code: Code.fromAsset(path.join(__dirname, '../lambda/get-gzip'))
    });

    const postGzipFn = new Function(ctx, 'PostGzipFn', {
        functionName: 'compression-demo-post-gzip',
        runtime: Runtime.NODEJS_20_X,
        handler: 'index.handler',
        memorySize: 1024,
        timeout: Duration.seconds(10),
        code: Code.fromAsset(path.join(__dirname, '../lambda/post-gzip'))
    });

    return { 
        getGzipFn,
        postGzipFn
    };

}

module.exports = {
    bootstrap
};