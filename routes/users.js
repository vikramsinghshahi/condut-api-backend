var express = require('express');
const User = require('../models/User');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next)
{
  res.send('respond with a resource');
});

//registring new user

router.post('/register', async (req, res, next) =>
{
  let data = req.body;
  if (!data.username || !data.password || !data.email)
  {
    return res.status(400).json({
      username: 'username cant be empty',
      email: 'email cant be empty',
      password: 'password cant be empty',
    });
  }

  try
  {
    let user = await User.findOne({ username: data.username });

    if (user)
    {
      return res.status(400).json({ username: 'user already exist' });
    }

    let createdUser = await User.create(data);

    return res.json({ user: createdUser });
  } catch (error)
  {
    next(error);
  }
});

//login user

router.post('/login', async (req, res, next) =>
{
  let { email, password } = req.body;

  if (!email || !password)
  {
    return res.status(400).json({
      email: ' email/password required',
      password: ' email/password required',
    });
  }

  try
  {
    let user = await User.findOne({ email });

    if (!user)
    {
      return res.status(400).json({
        email: ' user does not exist.',
      });
    }
    console.log('user', user);
    let result = await user.verifyPassword(password);
    console.log('result', result);
    if (!result)
    {
      return res.status(400).json({
        password: ' incorrect password.',
      });
    }

    let token = await user.createToken();

    return res.json({ token, user });
  } catch (error)
  {
    next(error);
  }
});
module.exports = router;