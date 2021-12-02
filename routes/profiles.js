var express = require('express');
var jwt = require('jsonwebtoken');
const User = require('../models/User');
const Profile = require('../models/Profile');
const auth = require('../middlewares/auth');
var router = express.Router();

//get profile by username

router.get('/:username', auth.isLoggedIn, async (req, res, next) =>
{
    let username = req.params.username;

    try
    {
        let profile = await User.findOne({ username })
            .populate({
                path: 'articles',
                populate: {
                    path: 'author',
                },
            })
            .populate({
                path: 'profile',
            })
            .populate({
                path: 'favoritedArticles',
                populate: {
                    path: 'author',
                },
            });

        if (!profile)
        {
            return res.status(400).json({ error: 'invalid profile name' });
        }
        return res.json({ profile });
    } catch (error)
    {
        next(error);
    }
});

//follow profile

router.post('/:username/follow', auth.isLoggedIn, async (req, res, next) =>
{
    let username = req.params.username;
    let loggedUser = req.user;
    try
    {
        let targetProfile = await Profile.findOne({ username });
        let targetUser = await User.findOne({ username });
        let loggedUserData = await User.findOne({ username: loggedUser.username });
        if (!targetProfile)
        {
            return res.json({ error: 'invalid profile username' });
        }

        if (username === loggedUser.username)
        {
            return res.json({ error: 'you can not follow yourself' });
        }
        let currentUser = await Profile.findOneAndUpdate(
            {
                username: loggedUser.username,
            },
            { $push: { following: targetUser.id } }
        );

        let updatedTarget = await Profile.findByIdAndUpdate(targetProfile.id, {
            $push: { followers: loggedUserData.id },
        });

        return res.json({ user: updatedTarget });
    } catch (error)
    {
        next(error);
    }
});

//unfollow profile

router.delete('/:username/follow', auth.isLoggedIn, async (req, res, next) =>
{
    let username = req.params.username;
    loggedUser = req.user;
    try
    {
        let targetProfile = await Profile.findOne({ username });
        let targetUser = await User.findOne({ username });
        let loggedUserData = await User.findOne({ username: loggedUser.username });
        if (!targetProfile)
        {
            return res.json({ error: 'invalid profile username' });
        }

        if (username === loggedUser.username)
        {
            return res.json({ error: 'you can not unfollow/follow yourself' });
        }
        let currentUser = await Profile.findOneAndUpdate(
            {
                username: loggedUser.username,
            },
            { $pull: { following: targetUser.id } }
        );

        let updatedTarget = await Profile.findByIdAndUpdate(targetProfile.id, {
            $pull: { followers: loggedUserData.id },
        });

        return res.json({ user: updatedTarget });
    } catch (error)
    {
        next(error);
    }
});

module.exports = router;