class Game {
    constructor(id, author, uploadDate, name, hash) {
        this.id = id;
        this.author = author;
        this.uploadDate = uploadDate;
        this.name = name;
        this.hash = hash;
    }
}

module.exports = Game;