import { AppSyncEvent } from './Post';
import createPost from './createPost';
import getPosts from './getPosts';

exports.handler = async (event: AppSyncEvent) => {
    switch (event.info.fieldName) {
        case "getPosts":
            return await getPosts();
        case "createPost":
            return await createPost(event.arguments.post);
        default:
            return null;
    }
}