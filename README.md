# Using data compression with AWS Lambda functions

This sample illustrates using data compression with Lambda functions to 
1. Potentially save on data transfer costs when using Lambda functions with NAT Gateway or VPC Endpoints
2. Receive and return payloads larger than the Lambda limit of 6MB. 

> Important: this sample uses various AWS services and there are costs associated with these services after the Free Tier usage - please see the [AWS Pricing page](https://aws.amazon.com/pricing/) for details. You are responsible for any AWS costs incurred. No warranty is implied in this example.

## How it works

The AWS Lambda Invoke API does not provide support for data compression. You can send requests and receive responses in plain-text formats only (such as JSON). The payload size for both request and response is limited to 6MB. 

While the Invoke API does not provide native compression support, you can easily introduce compression in your function code. In case you're invoking the function directly via the Invoke API or AWS SDK - you will be responsible for compression/decompression on both server and client side. However if you're invoking functions with API Gateway or Function URLs, those services can handle the compression for you, as illustrated in this sample. 

## Reducing payload sizes

In the sample code, a 1MB JSON payload is generated in function handler, compressed, returned via Function URL, and decompressed on the client side by a supporting client, such as Postman, back to its original form and length. 

See results using Postman, or similar tool. A 1MB plain text JSON payload is returned as a 200KB compressed payload. 

![](postmanresult.png)

This approach can help you to send and receive payloads larger than Lambda's limit of 6MB, as long as they're less than 6MB when compressed. 

## Saving on data transfer costs

It is common for cloud solutions residing in a VPC to invoke Lambda functions. For example an EKS-based control plane needs to invoke a series of Lambda functions. This is usually achieved through either NAT Gateway or VPC Endpoint. In this scenario, VPC Endpoint will commonly be less expensive - see [NAT Gateway pricing](https://aws.amazon.com/vpc/pricing/) and [VPC Endpoint pricing](https://aws.amazon.com/privatelink/pricing/).

Both NAT Gateway and VPC Endpoint are priced per GB of data processed, so reducing the volume of data by compressing it also reduces the data transfer cost. On the other side, compressing/decompressing data is a CPU-intensive activity, which will increase function invocation duration, and as a result Lambda cost. Below results illustrate a series of tests ran to estimate the impact of data compression of Lambda function invocation duration, Lambda function invocation cost, and data transfer costs delta with both NAT Gateway and VPC Endpoint. 

> Below tests were performed with a series of assumptions and randomly generated JSON data. You should always perform your own performance/cost estimates with representative payloads. Different payloads will have different compression ratios. Payloads with low compression ratios might not benefit from this technique.

## Assumptions

* Lambda cost (GB-s, ARM/Graviton2) - $0.000013 [(pricing)](https://aws.amazon.com/lambda/pricing/)
* NAT Gateway cost (per GB) - $0.045 [(pricing)](https://aws.amazon.com/vpc/pricing/)
* VPC Endpoint cost (per GB) - $0.010 [(pricing)](https://aws.amazon.com/privatelink/pricing/).
* Tested with different randomly generated JSON payload sizes - 10KB, 100KB, 1MB, 5MB
* Tested with different function memory configurations - 512MB, 1GB, 2GB (more allocated memory results in more allocated CPU capacity [(docs)(https://docs.aws.amazon.com/lambda/latest/dg/configuration-memory.html)]). 
* Estimate cost deltas for processing 1,000,000 requests
* Use gzip for data compression 

## Testing results

### Added duration - invocation duration delta (ms) (compressed vs uncompressed)

Compressing data is a CPU intensive activity, and as such it adds function invocation duration. The following chart illustrates the measured number of milliseconds added when compressing JSON objects of various sizes with various memory allocations. E.g. compressing a 1MB JSON object took on average 124ms when function was configured with 1GB of allocated memory. 

|       | 512MB | 1GB | 2GB |
| ----- | ----: | --: | --: |
| 10KB  | 1     | 1   | 1   |
| 100KB | 27    | 13  | 9   |
| 1MB   | 251   | 124 | 70  |
| 5MB   | 1210  | 588 | 342 |

### Added cost - invocation duration delta cost (compressed vs uncompressed)

The following chart illustrates the calculated estimate for added cost of compressing data. Continuing the example from previous chart - 1,000,000 invocations * 124ms per invocation * 1GB of allocated memory would result in 124,000 GB-seconds. 123,000 GB-seconds at $0.000013 per GB-second would cost $1.65.

|       | 512MB | 1GB   | 2GB   |
| ----- | ----: | ----: | ----: |
| 10KB  | $0.01 | $0.01 | $0.03 |
| 100KB | $0.18 | $0.17 | $0.24 |
| 1MB   | $1.67 | $1.65 | $1.87 |
| 5MB   | $8.07 | $7.84 | $8.64 |

### Savings - data transfer delta cost (compressed vs uncompressed)

Compressed data is commonly represented as a binary stream/buffer. Lambda requires binary data to be encoded as base64 prior to returning via API Gateway / Function URLs. For brevety, the term "compression" below implies gzipping and subsequently base64-encoding the data. 

Mean compression ratio of randomly generated JSON object was ~10-to-3, i.e. 1MB of JSON data produced a 300KB string after gzipping and base64-encoding, yielding ~70% space saving. 

The following chart illustrates estimated savings, or cost delta for sending uncompressed data vs compressed through NAT Gateway and VPC Endpoint. E.g. 
* Sending 1MB concompressed payload for 1,000,000 times would result in sending 1000GB total
* Compressing the same payload to 300KB and sending it for 1,000,000 times would result in sending 300GB total
* The delta of transferred data is 700MB
* When sent via NAT Gateway, 700GB * $0.045 per GB would cost $31.50

|       | NAT Gateway | VPC Endpoint (1 AZ) |
| ----- | ----------: | -----------: |
| 10KB  | $0.32       | $0.07        |
| 100KB | $3.15       | $0.70        |
| 1MB   | $31.50      | $7.00        |
| 5MB   | $157.50      | $35.00       |

### Conclusion

In all test cases the savings from sending compressed data via NAT Gateway or VPC Endpoint were higher than the added cost of compressing data in Lambda. The data compression technique can be applied as an efficient cost savings mechanism if you can tolerate added latency, especially at a large scale of millions/billions of invocations. Additionally, the compression technique can be applied for sending and receiving payloads with sizes over the 6MB limit. 

> Above tests were performed with a series of assumptions and randomly generated JSON data. You should always perform your own performance/cost estimates with representative payloads. Different payloads will have different compression ratios. Payloads with low compression ratios might not benefit from this technique.

## Requirements

* [Create an AWS account](https://portal.aws.amazon.com/gp/aws/developer/registration/index.html) if you do not already have one and log in. The IAM user that you use must have sufficient permissions to make necessary AWS service calls and manage AWS resources.
* [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html) installed and configured
* [Git Installed](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
* [AWS Cloud Development Kit](https://aws.amazon.com/cdk/) (AWS CDK) installed

## Deployment Instructions

1. Create a new directory, navigate to that directory in a terminal and clone the GitHub repository:
    ``` 
    git clone https://github.com/aws-samples/lambda-with-compression
    ```
1. Change directory to the pattern directory:
    ```
    cd lambda-with-compression
    ```
2. From the command line, use AWS CDK to deploy the AWS resources for the pattern:
    ```
    cdk deploy
    ```
3. Allow CDK CLI to create IAM roles with the required permissions.

4. Note the output from the CDK deployment process. It contain the FunctionUrl you will use for testing. This sample stack enforces IAM authentication for Function URL for better security. You will either need to use your AWS credentials to invoke the generated Function URL, or change the authentication type to `FunctionUrlAuthType.NONE` in `lambda-with-compression-stack.js`.

## Notes

* Using other compression methods, such as [zstd](https://facebook.github.io/zstd/), may yield different results
* For functions configured with >2GB of RAM it is important to use compression method that supports multiple vCPUs for maximum efficiency. 
* While this experiment focused on AWS Lambda, the same technique can be applied to any other service, e.g. reducing message sizes of large messages flowing through Amazon SQS. 

## Cleanup
 
Delete the stack

```bash
cdk destroy
```
----
Copyright 2023 Amazon.com, Inc. or its affiliates. All Rights Reserved.

SPDX-License-Identifier: MIT-0