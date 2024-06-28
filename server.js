// packages import
const express = require("express");
const app = express();
const cors = require("cors");
const axios = require("axios");
// enable CORS
app.use(cors());
// set the port on which our app wil run

// basic string route to prevent Glitch error
app.all('*', (req, res) => {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end()
    }
    else if(req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else{
        let targetURL = req.header('Target-URL');
        // return the data without modification
        if(!targetURL){
            res.send()
        }else{
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
    }
});

// console text when app is running
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});
