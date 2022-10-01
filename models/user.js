const mongoose = require('mongoose');

// Schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field is required"]
    },
    email: {
        type: String,
        required: [true, "Email field is required"]
    },
    passHash: {
        type: String,
        required: [true, "passHash field is required"]
    },
    permissions: [{ permId: String }],
    sessionTokens: [{ uuid: String }]
});

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

// Model
const User = mongoose.model("User", userSchema);

module.exports = User;