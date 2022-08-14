class Writer {
    constructor(
        id,
        role,
        bio,
        username,
        profilePicture,
        location,
        dateJoined,
        isVerified
    ) {
        this.id = id;
        this.role = role;
        this.bio = bio;
        this.username = username;
        this.profilePicture = profilePicture;
        this.location = location;
        this.dateJoined = dateJoined;
        this.isVerified = isVerified;
    }
}

module.exports = Writer;
