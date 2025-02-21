const { Size } = require('aws-cdk-lib');
const { RestApi, LambdaIntegration } = require('aws-cdk-lib/aws-apigateway');

const bootstrap = (ctx, getGzipFn, postGzipFn) => {
    const api = new RestApi(ctx, 'CompressionDemoApi', {
        restApiName: 'compression-demo-api',
        minCompressionSize: Size.kibibytes(1), // Enable compression for payloads >1KB
        binaryMediaTypes: ["application/gzip"],
        endpointExportName: "ApiGatewayEndpoint"
    });

    api.root.addMethod('GET', new LambdaIntegration(getGzipFn, {
        proxy: true
    }));

    api.root.addMethod('POST', new LambdaIntegration(postGzipFn, {
        proxy: true
    }));
}

module.exports = {
    bootstrap
};