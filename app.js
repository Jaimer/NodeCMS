const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {select} = require('./helpers/handlebars-helpers');
const methodOverride = require('method-override');

mongoose.connect('mongodb://localhost/cms', { useNewUrlParser: true }).then(db => {
    console.log('DB Connected');
}).catch(error => console.log('Could not connect to DB: ' + error));

mongoose.Promise = global.Promise;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {select: select}}));
app.set('view engine', 'handlebars');

const main = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');

app.use('/', main);
app.use('/admin', admin);
app.use('/admin/posts', posts);

app.listen(4500, ()=>{
    console.log(`listening on port 4500`);
});