class Game {
    constructor(id, authorUsername, s3StorageBucket, uploadDate) {
        this.id = id;
        this.authorUsername = authorUsername;
        this.s3StorageBucket = s3StorageBucket;
        this.uploadDate = uploadDate;
    }
}

