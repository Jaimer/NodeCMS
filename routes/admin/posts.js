const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Category = require('../../models/Category');
const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
const path = require('path');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    Post.find({})
    .populate('category')
    .then(posts => {
        res.render('admin/posts', {posts: posts});
    });
});

router.get('/create', (req, res)=>{
    Category.find({}).then(categories => {
        res.render('admin/posts/create', {categories: categories});
    });
});

router.get('/edit/:id', (req, res)=>{
    Post.findById(req.params.id).then(post=>{
        Category.find({}).then( categories => {
            res.render('admin/posts/edit', {post: post, categories: categories});
        });
    });
});

router.get('/my-posts', (req, res)=>{
    Post.find({user: req.user.id}).then(posts=>{
        res.render('admin/posts/my-posts', {posts: posts});
    });
});

router.put('/edit/:id', (req, res)=>{
    Post.findById(req.params.id).then(post=>{

        let allowComments = true;

        if(req.body.allowComments){
            allowComments = true;
        }else{
            allowComments = false;
        }

        post.user = req.user.id;
        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;
        post.category = req.body.category;

        if(!isEmpty(req.files)){
            let file = req.files.file;
            let filename = Date.now() + '-' + file.name;
            post.file = filename;

            file.mv('./public/uploads/' + filename, (err) => {
                if(err) throw err;
            });
        }

        post.save().then(updatedPost=>{
            req.flash('success_message', `Post ${post.title} updated successfully`);
            res.redirect('/admin/posts');
        });
    });
});

router.delete('/delete/:id', (req, res)=>{
    Post.findById(req.params.id)
    .populate('comments')
    .then(post => {
        if(post.file != 'url.jpeg'){
            fs.unlink(uploadDir + post.file, (err) => { });
        }
        if(!post.comments.length < 1){
            post.comments.forEach(comment => {
                comment.remove();
            });
        }
        post.remove().then(postRemoved => {
            req.flash('success_message', `Post ${post.title} was deleted`);
            res.redirect('/admin/posts')
        });
    });
});

router.post('/create', (req, res)=>{

    let filename = 'url.jpeg';

    if(!isEmpty(req.files)){
        let file = req.files.file;
        filename = Date.now() + '-' + file.name;

        file.mv('./public/uploads/' + filename, (err) => {
            if(err) throw err;
        });
    }

    let allowComments = true;

    if(req.body.allowComments){
        allowComments = true;
    }else{
        allowComments = false;
    }

    const newPost = new Post({
        user: req.user.id,
        title: req.body.title,
        status: req.body.status,
        allowComments: allowComments,
        body: req.body.body,
        category: req.body.category,
        file: filename
    });

    newPost.save().then(savedPost => {
        req.flash('success_message', `Post ${savedPost.title} was created succesfully` );
        res.redirect('/admin/posts');
    }).catch(validator => {
        res.render('admin/posts/create', {errors: validator.errors});
        console.log('Post not created: '+ validator);
    });
});

module.exports = router;