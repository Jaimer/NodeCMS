const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const faker = require('faker');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    res.render('admin/index', {user: req.user});
});

router.post('/generate-fake-posts', (req, res) => {
    for(let i = 0; i < req.body.amount; i++){
        let post = new Post();
        post.user = req.user.id;
        post.title = faker.name.title();
        post.status = 'public';
        post.allowComments = faker.random.boolean();
        post.body = faker.lorem.paragraph(5);
        post.file = 'url.jpeg'

        post.save().then(savedPost => {

        });
    }

    res.redirect('/admin/posts');
});

module.exports = router;