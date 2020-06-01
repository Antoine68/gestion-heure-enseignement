const express = require('express');
const app = express();
const engine = require('ejs-mate');
const router = require("./router");
const helmet = require('helmet');
const bodyParser = require('body-parser');
const methodOverride = require('method-override')

const PUBLIC_DIR = __dirname + '\\..\\public';
const VIEWS_DIR = __dirname + '\\..\\views';

app.use(methodOverride('_method'));
app.use(helmet());
app.use(bodyParser.json());
app.use(express.static(PUBLIC_DIR));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set('view options', {rmWhitespace: true});
app.set('views', VIEWS_DIR);
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", router);
app.listen(3000, function() {
    console.log('App listening on port 3000!')
})