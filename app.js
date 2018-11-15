const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {select, generateDate} = require('./helpers/handlebars-helpers');
const methodOverride = require('method-override');
const upload = require('express-fileupload');
const session = require('express-session');
const flash = require('connect-flash');

//MongoDB
mongoose.connect('mongodb://localhost/cms', { useNewUrlParser: true }).then(db => {
    console.log('DB Connected');
}).catch(error => console.log('Could not connect to DB: ' + error));

mongoose.Promise = global.Promise;

//Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride('_method'));
app.use(upload());
app.use(session({
    secret: 'thisisthesessionsecret123',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());
//Local Variables Using Middleware
app.use((req,res,next) =>{
    res.locals.success_message = req.flash('success_message');
    next();
})
app.engine('handlebars', exphbs({defaultLayout: 'home', helpers: {select: select, generateDate: generateDate}}));
app.set('view engine', 'handlebars');

//Main Routes
const main = require('./routes/home/index');
const admin = require('./routes/admin/index');
const posts = require('./routes/admin/posts');
const categories = require('./routes/admin/categories');

app.use('/', main);
app.use('/admin', admin);
app.use('/admin/posts', posts);
app.use('/admin/categories', categories);

//Launch App
app.listen(4500, ()=>{
    console.log(`listening on port 4500`);
});