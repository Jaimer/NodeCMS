const express = require('express');
const router = express.Router();
const Post = require('../../models/Post');
const Comment = require('../../models/Comment');
const {userAuthenticated} = require('../../helpers/authentication');

router.all('/*', userAuthenticated, (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req,res)=>{
    Comment.find({})
    .populate('user')
    .then(comments=>{
        res.render('admin/comments', {comments: comments});
    });
});

router.post('/', (req, res) =>{
    Post.findById(req.body.id).then(post=>{
        const newComment = new Comment({
            user: req.user.id,
            body: req.body.body
        });
        post.comments.push(newComment);
        post.save().then(savedPost=>{
            newComment.save().then(savedComment=>{
                res.redirect(`/post/${post.id}`);
            });
        });
    });
});

router.delete('/delete/:id', (req, res)=>{
    Comment.findById(req.params.id).then(comment => {
        comment.remove();
        req.flash('success_message', `Comment ${comment.id} was deleted`);
        res.redirect('/admin/comments')
    });
});

module.exports = router;