const express = require('express');
const app = express();
const path = require('path');
const exphbs = require('express-handlebars');

app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs({defaultLayout: 'home'}));
app.set('view engine', 'handlebars');

const main = require('./routes/home/main');

app.use('/', main);

app.listen(4500, ()=>{
    console.log(`listening on port 4500`);
});