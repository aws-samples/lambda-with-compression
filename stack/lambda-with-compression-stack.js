const { Stack, CfnOutput } = require('aws-cdk-lib');
const functions = require('./functions');
const furls = require('./furls');
const apis = require('./apigateway');

class LambdaWithCompressionStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    
    const {
      getGzipFn,
      postGzipFn
    } = functions.bootstrap(this);

    const {
      getGzipFurl,
      postGzipFurl
    } = furls.bootstrap(this, getGzipFn, postGzipFn);

    apis.bootstrap(this, getGzipFn, postGzipFn);

    new CfnOutput(this, 'GetGzipFurl', {
      value: getGzipFurl.url
    });

    new CfnOutput(this, 'PostGzipFurl', {
      value: postGzipFurl.url
    });

  }
}

module.exports = { LambdaWithCompressionStack }
