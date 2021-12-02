var express = require('express');
var jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const auth = require('../middlewares/auth');
const _ = require('lodash');
var router = express.Router();

/* GET  user data. */
router.get('/', auth.isLoggedIn, async function (req, res, next)
{
    let token = req.headers.authorization;

    let profileData = await jwt.verify(token, 'thisissecret');

    try
    {
        let user = await User.findOne({ username: profileData.username }).populate(
            'profile'
        );
        if (!user)
        {
            return res.status(400).json({ error: 'invalid token' });
        }
        res.json({ user });
    } catch (error)
    {
        next(error);
    }
});

//update user data

router.put('/', auth.isLoggedIn, async (req, res, next) =>
{
    let data = req.body.user;
    console.log(data);

    try
    {
        let updatedUser = await User.findOneAndUpdate(
            {
                username: req.user.username,
            },
            data
        );
        let updatedProfile = await Profile.findOneAndUpdate(
            {
                username: req.user.username,
            },
            data
        );

        res.json({ user: updatedUser });
    } catch (error)
    {
        next(error);
    }
});

//get all articles of following user

router.get('/following', auth.isLoggedIn, async (req, res, next) =>
{
    let loggedprofile = await Profile.findOne({
        username: req.user.username,
    }).populate({
        path: 'following',
        populate: {
            path: 'articles',
        },
    });
    console.log(loggedprofile);
    let followingArray = loggedprofile.following;

    let articles = followingArray.map((user, i) =>
    {
        return user.articles;
    });

    res.json({ articles: _.flattenDeep(articles) });
});

module.exports = router;