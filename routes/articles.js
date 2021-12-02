var express = require('express');
const auth = require('../middlewares/auth');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const Profile = require('../models/Profile');
const User = require('../models/User');
var router = express.Router();

/* create new articles. */
router.post('/', auth.isLoggedIn, async function (req, res, next)
{
    let data = req.body;
    let loggedUser = await Profile.findOne({ username: req.user.username });
    data.author = loggedUser._id;

    let createdArticle = await Article.create(data);

    let updatedUser = await User.findOneAndUpdate(
        {
            username: loggedUser.username,
        },
        { $push: { articles: createdArticle.id } }
    );

    res.json({ article: createdArticle });
});
/* get article by tag. */
router.get('/tag/:tag', async function (req, res, next)
{
    let tag = req.params.tag;

    let articles = await Article.find({ tagList: tag }).populate('author');

    res.json({ articles: articles });
});

// get articles
router.get('/', async function (req, res, next)
{
    let allArticles = await Article.find({}).populate('author');
    res.json({ articles: allArticles });
});

// favourate article by slug

router.post(
    '/:slug/favorite',
    auth.isLoggedIn,
    async function (req, res, next)
    {
        let slug = req.params.slug;
        let username = req.user.username;

        let loggedUser = await User.findOne({ username });

        let updatedArticle = await Article.findOneAndUpdate(
            { slug },
            { $push: { favoritedBy: loggedUser._id }, $inc: { favoritesCount: 1 } },
            { returnNewDocument: true }
        );

        let updatedUser = await User.findByIdAndUpdate(loggedUser._id, {
            $push: { favoritedArticles: updatedArticle._id },
        });

        res.json({ article: updatedArticle });
    }
);

//remove favourate article by slug

router.delete(
    '/:slug/favorite',
    auth.isLoggedIn,
    async function (req, res, next)
    {
        let slug = req.params.slug;
        let username = req.user.username;

        let loggedUser = await User.findOne({ username });

        let updatedArticle = await Article.findOneAndUpdate(
            { slug },
            { $pull: { favoritedBy: loggedUser._id }, $inc: { favoritesCount: -1 } },
            { returnNewDocument: true }
        );

        let updatedUser = await User.findByIdAndUpdate(loggedUser._id, {
            $pull: { favoritedArticles: updatedArticle._id },
        });

        res.json({ article: updatedArticle });
    }
);

/* get article by slug. */
router.get('/:slug', async function (req, res, next)
{
    let slug = req.params.slug;

    let article = await Article.findOne({ slug })
        .populate('author')
        .populate('comments');

    res.json({ article: article });
});

/* update articles. */
router.put('/:slug', auth.isLoggedIn, async function (req, res, next)
{
    let slug = req.params.slug;
    let data = req.body;
    let article = await Article.findOneAndUpdate({ slug }, data);

    res.json({ article: article });
});

/* delete articles. */
router.delete('/:slug', auth.isLoggedIn, async function (req, res, next)
{
    let slug = req.params.slug;

    let article = await Article.findOneAndDelete({ slug });

    let updatedUser = await User.findOneAndUpdate(
        {
            username: article.author.username,
        },
        { $pull: { articles: article.id } }
    );

    res.json({ article: article });
});

/* create new comment. */
router.post(
    '/:slug/comments',
    auth.isLoggedIn,
    async function (req, res, next)
    {
        let slug = req.params.slug;
        let data = req.body;
        data.author = req.user;
        let article = await Article.findOne({ slug });

        data.article = article.id;

        let comment = await Comment.create(data);

        let loggedUser = await User.findOne({ username: req.user.username });

        let updatedUser = await User.findByIdAndUpdate(
            loggedUser.id,

            { $push: { comments: comment.id } }
        );

        let updatedArticle = await Article.findByIdAndUpdate(
            article.id,

            { $push: { comments: comment.id } }
        );

        res.json({ comment });
    }
);

//get comments on article

router.get('/:slug/comments', auth.isLoggedIn, async (req, res, next) =>
{
    let slug = req.params.slug;

    let article = await Article.findOne({ slug }).populate('comments');

    res.json({ comments: article.comments });
});

//delete comment

router.delete(
    '/:slug/comments/:id',
    auth.isLoggedIn,
    async (req, res, next) =>
    {
        let slug = req.params.slug;
        let commentId = req.params.id;

        let deletedComment = await Comment.findByIdAndDelete(commentId);

        let updatedUser = await User.findOneAndUpdate(
            { username: deletedComment.author.username },
            { $pull: { comments: deletedComment.id } }
        );

        let updatedArticle = await Article.findOneAndUpdate(
            { slug },
            { $pull: { comments: deletedComment.id } }
        );

        res.json({ comment: deletedComment });
    }
);
module.exports = router;