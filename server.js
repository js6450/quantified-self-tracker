const express = require('express');
const logger = require('morgan');
const http = require('http');
const path = require('path');
// const multer = require('multer');

const basicAuth = require('express-basic-auth');
const mongoose = require('mongoose');
// const Datastore = require('nedb');
const app = express();
// const router = express.Router();

// const storage = multer.diskStorage({
//     destination: function(req, res, cb){
//         cb(null, 'uploads/');
//     }
// });
//
// const upload = multer({storage: storage});


/****************************
 * your config will grab your approved USERNAME and PASSWORD from your .env
 ****************************/
const config = require('./config');

/****************************
 * your mongodb
 ****************************/
// load up nedb
// const pathToData = path.resolve(__dirname, "db/db")
// const db = new Datastore({ filename: pathToData});
// db.loadDatabase();

// load up mongoose
mongoose.connect(config.MONGODB_URL, {useNewUrlParser: true});
const Schema = mongoose.Schema;
const InputSchema = new Schema({
    date: String,
    img: String,
    imgLoc: String,
    imgDate: String
});
const HelloModel = mongoose.model('input', InputSchema)

/****************************
 * setting up important middleware functionality
 ****************************/
// Handling JSON data 
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// your dev logger
app.use(logger('dev'));

// setting your static items routes to public
app.use(express.static(path.resolve(__dirname, 'public')));

/****************************
 * your authentication 
 ****************************/
const challengeAuth = basicAuth({
    authorizer: myAuthorizer,
    challenge: true,
    unauthorizedResponse:getUnauthorizedResponse
});
//Custom authorizer checking if the username starts with 'A' and the password with 'secret'
function myAuthorizer(username, password) {
    return username == config.USERNAME && password == config.PASSWORD
}
function getUnauthorizedResponse(req) {
    return 'not authorized'
}

/****************************
 * your view
 ****************************/
app.get("/", challengeAuth, (req, res)=> {
    res.sendFile("index.html")
});

/****************************
 * API endpoints
 ****************************/

 /**
  * GET /api
  */
app.get("/api", challengeAuth, (req, res) => {
   // console.log(req.body)
    
    HelloModel.find({}, (err, doc)=> {
        res.send(doc);
    })
});

/**
  * POST /api
  */
app.post("/api", challengeAuth, (req, res) => {
    console.log('received: ');
    console.log(req.body);
    HelloModel.create(req.body, (err, doc)=> {
        //console.log(doc);
        res.send(doc);
    })
});

// if all fails go here
app.use((req, res) => {
    res.status(404).send("404 - either not authorized or no route")
});

/*************************
  * create http server and listen
*************************/
http.createServer(app).listen(config.PORT, () => {
    console.log(`see the magic at http://localhost:${config.PORT}`);
});