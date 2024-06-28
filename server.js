var express = require('express'),
    request = require('request'),
    bodyParser = require('body-parser'),
    app = express();
// const cors = require("cors");
const axios = require("axios");

var myLimit = typeof(process.argv[2]) != 'undefined' ? process.argv[2] : '100kb';
console.log('Using limit: ', myLimit);

app.use(bodyParser.json({limit: myLimit}));

app.all('*', function (req, res, next) {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end()
    }
    else if(req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else{
        let targetURL = req.header('Target-URL');
        // return the data without modification
        axios({
            url: targetURL+ req.url, 
            method: req.method, 
            'Content-Type': 'application/json;charset=UTF-8',
            "Access-Control-Allow-Origin": "*",
        }).then((response)=>{
            if (response.status === 200) {
                console.log(response.status);
                res.send(response.data);
            } else {
                console.error('Failed to fetchinng holders data:', response.status);
                res.send();
            }
        });
    }
});

app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});
