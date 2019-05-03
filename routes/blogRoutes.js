const mongoose = require('mongoose');
const requireLogin = require('../middlewares/requireLogin');
const Blog = mongoose.model('Blog');

const { clearHash } = require("../services/cache")
const clearCache = require("../middlewares/cleanCache")

module.exports = app => {
  app.get('/api/blogs/:id', requireLogin, async (req, res) => {
    const blog = await Blog.findOne({
      _user: req.user.id,
      _id: req.params.id
    });
    res.send(blog);

  });

  app.get('/api/blogs', requireLogin, async (req, res) => {
    const blogs = await Blog.find({ _user: req.user.id }).cache({ key: req.user.id });
    res.send(blogs);
  });

  app.post('/api/blogs', requireLogin, clearCache async (req, res) => {

    // a middleware runs before the function defination
    //we dont want the middle ware of clearCache to run before hand as there is no logic 
    //clearing all the cache if there was some error in the post request
    // thus in the middleware is made async await --> can see it in the middleware's code


    const { title, content } = req.body;

    const blog = new Blog({
      title,
      content,
      _user: req.user.id
    });

    try {
      await blog.save();
      res.send(blog);
    } catch (err) {
      res.send(400, err);
    }

    // clearHash(req.user.id) --> alternative to this is making a middlewre and hence doing that
    //clearing all the cache in redis corresponding to the particuar user 
    //on every  post request, the reason is that
    //if once cached the new post will not be fetched from cache server
    //hence in consistent work flow
  });
};
