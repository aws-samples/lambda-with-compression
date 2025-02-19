const { FunctionUrlAuthType } = require('aws-cdk-lib/aws-lambda');

const bootstrap = (ctx, params) => {

    const receiveGzipFunctionFurl = params.recieveGzipFunction.addFunctionUrl({
        authType: FunctionUrlAuthType.AWS_IAM
      });
  
      const returnGzipFunctionFurl = params.returnGzipFunction.addFunctionUrl({
        authType: FunctionUrlAuthType.AWS_IAM
      });
  
    return { 
        receiveGzipFunctionFurl,
        returnGzipFunctionFurl
    };

}

module.exports = {
    bootstrap
};