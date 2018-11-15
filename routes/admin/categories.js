const express = require('express');
const router = express.Router();
const Category = require('../../models/Category');

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'admin';
    next();
});

router.get('/', (req, res)=>{
    Category.find({}).then(categories => {
        res.render('admin/categories/index', {categories: categories});
    });
});

router.post('/create', (req, res)=>{
    const newCategory = Category({
        name: req.body.name
    });

    newCategory.save().then(savedCategory => {
        res.redirect('/admin/categories');
    });
});

router.get('/edit/:id', (req, res)=>{
    Category.findById(req.params.id).then(category => {
        res.render('admin/categories/edit', {category: category});
    });
});

router.put('/edit/:id', (req, res)=>{
    Category.findById(req.params.id).then(category => {
        category.name = req.body.name;

        category.save().then(updatedCategory => {
            req.flash('success_message', `Category ${category.name} updated successfully`);
            res.redirect('/admin/categories');
        });
    });
});

router.delete('/delete/:id', (req, res)=>{
    Category.findById(req.params.id).then(category => {
        category.remove();
        req.flash('success_message', `Category ${category.name} was deleted`);
        res.redirect('/admin/categories')
    });
});


module.exports = router;