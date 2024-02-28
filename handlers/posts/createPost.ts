import * as AWS from '@aws-sdk/client-dynamodb';
import { Post } from './Post';
const client = new AWS.DynamoDB({ region: process.env.REGION });

async function createPost(post: Post) {
    if (!post.title || !post.content) return null;

    const params = {
        TableName: process.env.POSTS_TABLE,
        Item: {
            title: {
                "S": post.title
            },
            content: {
                "S": post.content
            }
        }
    };

    try {
        await client.send(new AWS.PutItemCommand(params));
        return post;
    } catch (err) {
        console.log('DynamoDB error on Posts table', err);
        return null;
    }

}

export default createPost;