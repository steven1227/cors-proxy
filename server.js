// packages import
const express = require("express");
const app = express();
const cors = require("cors");
// const axios = require("axios");
const cloudscraper = require("cloudscraper");
// enable CORS
app.use(cors());
// set the port on which our app wil run

// basic string route to prevent Glitch error
app.all('*', (req, res) => {
    if (req.originalUrl.includes('favicon.ico')) {
        res.status(204).end()
    }
    else if (req.method === 'OPTIONS') {
        // CORS Preflight
        res.send();
    } else {
        let targetURL = req.header('Target-URL');
        // return the data without modification
        if (!targetURL) {
            res.send()
        } else {
            
         if (targetURL == "https://gmgn.ai") {
            
                cloudscraper.get(targetURL + req.url)
                    .then(response => {
                        const jsonResponse = JSON.parse(response);
                         console.log('Response:', jsonResponse.code);
                        res.send(jsonResponse.data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        res.send();
                    });
            } else {
                cloudscraper.get(targetURL + req.url).then((response) => {
                         const jsonResponse = JSON.parse(response);
                         console.log('Response:', jsonResponse);
                        res.send(jsonResponse);
                
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        res.send();
                    });
               
            }

        }
    }
});

// console text when app is running
app.set('port', process.env.PORT || 3000);

app.listen(app.get('port'), function () {
    console.log('Proxy server listening on port ' + app.get('port'));
});
