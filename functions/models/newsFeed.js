class NewsFeed {
    constructor(
        id,
        title,
        content,
        postedBy,
        postedAt,
        link,
        contentUrls,
        imgUrls
    ) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.postedBy = postedBy;
        this.postedAt = postedAt;
        this.link = link;
        this.contentUrls = contentUrls;
        this.imgUrls = imgUrls;
    }
}

module.exports = NewsFeed;
