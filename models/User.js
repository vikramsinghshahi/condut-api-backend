let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
const Profile = require('./Profile');

let Schema = mongoose.Schema;

let userSchema = new Schema({
    email: { type: String, unique: true },
    token: String,
    username: { type: String, unique: true },
    password: { type: String },
    bio: String,
    image: { type: String, default: null },
    profile: { type: mongoose.Types.ObjectId, ref: 'Profile' },
    articles: [{ type: mongoose.Types.ObjectId, ref: 'Article' }],
    favoritedArticles: [{ type: mongoose.Types.ObjectId, ref: 'Article' }],
    comments: [{ type: mongoose.Types.ObjectId, red: 'Comment' }],
});

userSchema.pre('save', async function (next)
{
    try
    {
        this.password = await bcrypt.hash(this.password, 10);
        let profileData = {
            username: this.username,
            bio: this.bio,
            image: this.image,
        };

        let profile = await Profile.create(profileData);
        this.profile = profile.id;
        next();
    } catch (error)
    {
        next(error);
    }
});

userSchema.methods.verifyPassword = async function (password)
{
    try
    {
        let result = await bcrypt.compare(password, this.password);

        return result;
    } catch (error)
    {
        return error;
    }
};

userSchema.methods.createToken = async function (password)
{
    try
    {
        let profileData = await Profile.findById(this.profile);
        let payload = {
            username: profileData.username,
            bio: profileData.bio,
            image: profileData.image,
        };

        let token = await jwt.sign(payload, 'thisissecret');

        return token;
    } catch (error)
    {
        return error;
    }
};

let User = mongoose.model('User', userSchema);

module.exports = User;