const express = require('express'); // main library for server-client routing
const MongoClient = require('mongodb').MongoClient;
const fs = require('fs'); // file system
const multer = require('multer'); // file storing middleware
const bodyParser = require('body-parser'); //cleans our req.body
const assert = require('assert');

//Add function to get annotation data
function getAnnotations (db) {
  return new Promise(function(resolve, reject) {
     db.collection("annotations").find().toArray( function(err, docs) {
      if (err) {
        // Reject the Promise with an error
        return reject(err)
      }

      // Resolve (or fulfill) the promise with data
      return resolve(docs)
    })
  })
}

/**Use MongoDB :( 
 * god i hate it so much
*/
const url = 'mongodb://localhost:27017';
// Database Name
const dbName = 'uxSenseDB';

// Create a new MongoClient
const client = new MongoClient(url);

var app = express();

/**
 * handle body requests, account for JSON parsing
 */
app.use(bodyParser.urlencoded({extended:false})); 
app.use(bodyParser.json());

/**
 * MULTER CONFIG: we will want to set this up for our server video storage
 */

/*
const multerConfig = {
    
  storage: multer.diskStorage({ //Setup where the user's file will go
    destination: function(req, file, next){
      next(null, './uploads');
    },   
      
    //Then give the file a unique name
    filename: function(req, file, next){
        console.log(file);
        const ext = file.mimetype.split('/')[1];
        next(null, file.fieldname + '-' + Date.now() + '.'+ext);
    }
  }),   
  
  //A means of ensuring only videos are uploaded. 
  fileFilter: function(req, file, next){
        if(!file){
          next();
        }
      const video = file.mimetype.startsWith('video/');
      if(video){
        console.log('video uploaded');
        next(null, true);
      } else {
        console.log("file not supported");
        
        //TODO:  A better message response to user on failure.
        return next();
      }
  }
};
*/

/** Create handler to git pull on client request */
function pullHandler(req, res) {
  var sys = require('sys')

  
  function puts(error, stdout, stderr) { sys.puts(stdout) }
    
  var exec = require('child_process').exec;
  exec("cd /usr/GitHub/uxSense && git resent --hard HEAD && git pull", puts);
  res.redirect('/');
}
  


/**
 * ...But for now, let's just set up db router, location of public files, and run the app. 
 */
 app.use(express.static(__dirname + '/public'))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html')
})

app.get('/updateServer', function(req, res) {
  pullHandler(req, res);
})


app.listen(3000, function () {
    console.log('Listening on port 3000!')
  });

app.post('/log', function (req, res){

    // Use connect method to connect to the Server
    client.connect(function(err, client) {
      assert.equal(null, err);
      console.log("Connected correctly to server");

      const db = client.db(dbName);

      // Insert an entry
      db.collection('interactionlog').insertOne(req.body, function(err, r) {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount);
      });
    });

    res.redirect('/');
 
 });

//add annotation handler
 app.post('/annotate', function (req, res, callback){

  //todo: instead of console logging, we need to write to fs somewhere.
    console.log(req.body);
    console.log('req received');
    
    //redirect to index
    res.redirect('/');

    // Use connect method to connect to the Server
    client.connect(function(err, client) {
      assert.equal(null, err);
      console.log("Connected correctly to server");

      const db = client.db(dbName);

      // Insert a single document
      db.collection('annotations').insertOne(req.body, function(err, r) {
        assert.equal(null, err);
        assert.equal(1, r.insertedCount);
      // Overwrite public file
      getAnnotations(db).then(query => fs.writeFile('public/userAnnotations/data.json', JSON.stringify(query), (err, data)=>{console.log(err);}))
      });
    });
 });


