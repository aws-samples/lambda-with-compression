const { FunctionUrlAuthType } = require('aws-cdk-lib/aws-lambda');

const bootstrap = (ctx, getGzipFn, postGzipFn) => {

    const getGzipFurl = getGzipFn.addFunctionUrl({
        authType: FunctionUrlAuthType.AWS_IAM
      });
  
      const postGzipFurl = postGzipFn.addFunctionUrl({
        authType: FunctionUrlAuthType.AWS_IAM
      });
  
    return { 
      getGzipFurl,
      postGzipFurl
    };

}

module.exports = {
    bootstrap
};