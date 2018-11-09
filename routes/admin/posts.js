const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const {isEmpty, uploadDir} = require('../../helpers/upload-helper');
const fs = require('fs');
const path = require('path');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    Post.find({}).then(posts => {
        res.render('admin/posts', {posts: posts});
    });
});

router.get('/create', (req, res)=>{
    res.render('admin/posts/create');
});

router.get('/edit/:id', (req, res)=>{
    Post.findById(req.params.id).then(post=>{
        res.render('admin/posts/edit', {post: post});
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

        post.title = req.body.title;
        post.status = req.body.status;
        post.allowComments = allowComments;
        post.body = req.body.body;

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
    Post.findById(req.params.id).then(post => {
        post.remove();
        if(post.file != 'url.jpeg'){
            fs.unlink(uploadDir + post.file, (err) => { });
        }
        req.flash('success_message', `Post ${post.title} was deleted`);
        res.redirect('/admin/posts')
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
        title: req.body.title,
        status: req.body.status,
        allowComments: allowComments,
        body: req.body.body,
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