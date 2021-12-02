let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let slugger = require('slugger');

let Schema = mongoose.Schema;

let articleSchema = new Schema(
    {
        slug: { type: String, require: true, unique: true },
        title: { type: String, require: true },
        description: { type: String },
        body: { type: String },
        tagList: [{ type: String }],
        favoritedBy: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
        favoritesCount: { type: Number, default: 0 },
        author: { type: mongoose.Types.ObjectId, require: true, ref: 'Profile' },
        comments: [{ type: mongoose.Types.ObjectId, ref: 'Comment' }],
    },
    { timestamps: true }
);

articleSchema.pre('save', async function (next)
{
    this.slug = slugger(this.title);
    next();
});

let Article = mongoose.model('Article', articleSchema);

module.exports = Article;