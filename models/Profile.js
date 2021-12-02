let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let slugger = require('slugger');

let Schema = mongoose.Schema;

let profileSchema = new Schema({
    username: { type: String, unique: true },
    following: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
    bio: String,
    image: { type: String, default: null },
    user: { type: mongoose.Types.ObjectId, ref: 'User' },
});

profileSchema.pre('save', async function (next)
{
    next();
});

let Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;