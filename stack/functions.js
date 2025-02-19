const path = require('path');
const { Function, Runtime, Code } = require('aws-cdk-lib/aws-lambda');
const { Duration } = require('aws-cdk-lib');

const bootstrap = (ctx) => {
    const recieveGzipFunction = new Function(ctx, 'ReceiveGzipFunction', {
        functionName: 'compression-demo-receive-gzip',
        runtime: Runtime.NODEJS_20_X,
        handler: 'index.handler',
        memorySize: 1024,
        timeout: Duration.seconds(10),
        code: Code.fromAsset(path.join(__dirname, '../lambda/receive-gzip'))
    });

    const returnGzipFunction = new Function(ctx, 'ReturnGzipFunction', {
        functionName: 'compression-demo-return-gzip',
        runtime: Runtime.NODEJS_20_X,
        handler: 'index.handler',
        memorySize: 1024,
        timeout: Duration.seconds(10),
        code: Code.fromAsset(path.join(__dirname, '../lambda/return-gzip'))
    });



    return { 
        returnGzipFunction,
        recieveGzipFunction
    };

}

module.exports = {
    bootstrap
};