const { Stack, CfnOutput } = require('aws-cdk-lib');
const functions = require('./functions');
const furls = require('./furls');

class LambdaWithCompressionStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    
    const {
      recieveGzipFunction,
      returnGzipFunction
    } = functions.bootstrap(this);

    const {
      receiveGzipFunctionFurl,
      returnGzipFunctionFurl
    } = furls.bootstrap(this, {
      recieveGzipFunction, 
      returnGzipFunction
    });

    new CfnOutput(this, 'ReceiveGzipFunctionFurl', {
      value: receiveGzipFunctionFurl.url
    });

    new CfnOutput(this, 'ReturnGzipFunctionFurl', {
      value: returnGzipFunctionFurl.url
    });

  }
}

module.exports = { LambdaWithCompressionStack }
