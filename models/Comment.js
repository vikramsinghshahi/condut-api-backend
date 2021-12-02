let mongoose = require('mongoose');
let bcrypt = require('bcryptjs');
let slugger = require('slugger');

let Schema = mongoose.Schema;

let commentSchema = new Schema(
    {
        author: { type: Object, require: true },
        body: { type: String, require: true },
        article: { type: mongoose.Types.ObjectId, ref: 'Article' },
    },
    { timestamps: true }
);

commentSchema.pre('save', async function (next)
{
    next();
});

let Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;