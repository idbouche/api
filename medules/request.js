var https = require('https');

module.exports = {
  getCall: function(number, city) {
    var appAccessToken = '39291ac3fc60f5609052f7bc6997f4e49f79945c';
    var options = {
        host :  'api.jcdecaux.com',
        //port : ,
        path : '/vls/v1/stations/'+ number +'?contract='+city+'&apiKey='+appAccessToken,
        method : 'GET'
    }

    //making the https get call
    var getReq = https.request(options, function(res) {

        res.on('data', function(data) {
            //console.log( JSON.parse(data) );
            return JSON.parse(data);
        });
        console.log(res.on.data);

      });

      //end the request
      getReq.end();
      getReq.on('error', function(err){
        console.log("Error: ", err);
      });
  }


};
