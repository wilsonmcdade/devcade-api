class Game {
    constructor(id, author, uploadDate, name, hash, description, iconLink, bannerLink, authrequired) {
        this.id = id;
        this.author = author;
        this.uploadDate = uploadDate;
        this.name = name;
        this.hash = hash;
        this.description = description;
        this.iconLink = iconLink;
        this.bannerLink = bannerLink;
        this.authrequired = authrequired;
    }
}

module.exports = Game;