import * as AWS from '@aws-sdk/client-dynamodb';
const client = new AWS.DynamoDB({ 
    region: process.env.REGION 
});

async function getPosts() {
    const params = {
        TableName: process.env.POSTS_TABLE
    };

    try {
        const { Items } = await client.send(new AWS.ScanCommand(params));
        return Items;
    } catch (err) {
        console.log('DynamoDB error on Posts table', err);
        return null;
    }
}

export default getPosts;