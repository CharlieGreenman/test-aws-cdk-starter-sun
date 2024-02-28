import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

export class TestAwsCdkStarterSunStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
    * Create AppSync GraphQL API
    * uses `x-api-key` headers as the authorization type
    */
    const api = new appsync.GraphqlApi(this, 'posts-api', {
      name: 'posts-api',
      definition: appsync.Definition.fromFile('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365))
          }
        },
      },
      xrayEnabled: true,
    });

    // Create our Posts DynamoDB table
    const postsTable = new dynamodb.Table(this, 'posts-table', {
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING
      }
    });

    // Create the Posts lambda handler
    const postsLambda = new NodejsFunction(this, 'PostsHandler', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: 'handlers/posts/main.ts',
      handler: 'handler',
      environment: {
        POSTS_TABLE: postsTable.tableName,
        REGION: this.region,
      },
    });

    const postsDs = api.addLambdaDataSource('postsDataSource', postsLambda);

    // Attach our GraphQL resolvers
    postsDs.createResolver("getPostsResolver", {
      typeName: "Query",
      fieldName: "getPosts"
    });

    postsDs.createResolver("createPostResolver", {
      typeName: "Mutation",
      fieldName: "createPost"
    });

    // Enable lambda function to access DynamoDB table and add environment variable to use in resolver functions
    postsTable.grantFullAccess(postsLambda);


    // print out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl
    });

    // print out the AppSync API Key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // print out the stack region
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });
  }
}
