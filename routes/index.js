var express = require('express');
var router = express.Router();
var db = require('../medules/db');
var fs = require('fs');
var geolib = require('geolib');
var _ = require('lodash');
var request = require('request');
var https = require('https');
var path = require('path');
var fileUpload = require('express-fileupload');


const DIR_UPLOADS = path.join(__dirname , "../uploads/");

var Converter = require("csvtojson").Converter;
var converter = new Converter({});

/* GET home documentation*/
router.get('/', function(req, res, next) {
  res.render('home',{title: 'API'})
});

/* GET API interface*/
router.get('/api', function(req, res, next) {
  res.render('index',{title: 'API'})
});

/* GET search by key word*/
router.get('/api/search', function(req, res, next) {
  var keyWord = req.param('keyWord').toUpperCase().replace(/,/g, " ");;
  var city = req.param('city')
  var collection = db.get().collection(city );
  collection.find({ $text: { $search: `\"${keyWord}\"` } }).toArray(function(err, result) {
    if (err) {
      throw err;
    }else {
      var number = result[0].Number;
      var appAccessToken = '39291ac3fc60f5609052f7bc6997f4e49f79945c';
      request('https://api.jcdecaux.com/vls/v1/stations/'+ number +'?contract='+city+'&apiKey='+appAccessToken ,
      function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log(JSON.parse(body));
          var data = JSON.parse(body)
          //res.json(data)
          res.render('index',{title: 'API', station:data})
        }
      });
    }
  });
});

/* GET the nearest  bisycle stop*/
router.get('/api/geo/', function(req, res, next) {
  var location = JSON.parse("[" + req.param('location') + "]")
  var geolocation = {
    latitude: location[0],
    longitude: location[1]
  }
  var coord = [];
  var tab = [];
  var collection = db.get().collection(req.param('city') );
  collection.find({}).toArray(function(err, result) {
    if (err) {
      throw err;
      return;
    }
    //Find loction only.
    collection.find({},{"_id":0, "Number":0, "Name":0, "Address":0})
    .toArray(function(err, coord) {
      if (err) {
        throw err;
        return;
      }
      for(var i=0; i < coord.length; i++) {
        if (typeof coord[i].Latitude  === 'string') {
          coord[i].Latitude = coord[i].field6
        }
        var str = JSON.stringify(coord[i]).replace(/L/g, 'l');
        coord[i]= JSON.parse(str)
      }
      var location = geolib.orderByDistance(geolocation,coord);
      res.render('index',{location: location})
      //res.json( location);
    });
  });
});

/* POST  convert File csv to json and insert on mongodb data base. */
router.post('/api', function(req, res, next) {
  var sampleFile, uploadPath ;
  if (!req.files) {
    res.status(400).send('No files were uploaded.');
    return;
  }
  sampleFile = req.files.file;
  uploadPath = path.join(__dirname ,'../uploads/'+sampleFile.name);
  sampleFile.mv(uploadPath, function(err) {
    if (err) {
      res.status(500).send(err);
    }
    else {
      //Convert CSV to JSON.
      converter.fromFile(uploadPath,function(err,result){
        if(err){
          throw err
        }
        var nameCollection = sampleFile.name.slice(0, -4).toLowerCase()
        var collection = db.get().collection(nameCollection);
        collection.insert( result ,function(err, result) {
          if (err) {
            throw err;
            return
          }
          collection.createIndex( { Name: "text", Address: "text" } )
          //Delete file
          fs.unlinkSync(uploadPath);
          //res.json(result );
          res.render('index',{lists: result} );
        });
      });
    }
  });
});

/* GET List orderBy Name or Address. */
router.get('/api/list', function(req, res, next) {
  var orderby = req.param('orderby');
  var collection = db.get().collection(req.param('city') );
  if (orderby == "name"){
    //Find data and order by name
    collection.find().sort( { "Name": 1 } ).toArray(function(err, result) {
      if (err) {
        throw err;
      }
      //res.json(result );
      res.render('index',{lists: result} );
    });
  }else if (orderby == "address"){
    //Find data and order by address
    collection.find().sort( { "Address": 1 } ).toArray(function(err, result) {
      if (err) {
        throw err;
      }
      //res.json(result );
      res.render('index',{lists: result} );
    });
  }
});

module.exports = router;
