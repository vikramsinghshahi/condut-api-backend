var express = require('express');
const Article = require('../models/Article');
var router = express.Router();
let _ = require('lodash');

/* GET home page. */
router.get('/', function (req, res, next)
{
  res.json({ hello: 'Hello from the index route' });
});

/* GET tags . */
router.get('/tags', async function (req, res, next)
{
  let allArticles = await Article.find({});

  let arrOfTags = allArticles.reduce((acc, cv) =>
  {
    acc.push(cv.tagList);
    return acc;
  }, []);

  arrOfTags = _.uniq(_.flattenDeep(arrOfTags));

  res.json({ tags: arrOfTags });
});
module.exports = router;