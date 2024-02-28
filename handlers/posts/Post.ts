export type AppSyncEvent = {
    info: {
        fieldName: string
    }
    arguments: {
        post: Post
    }
}

export type Post = {
    id: string
    title: string
    content: string
}