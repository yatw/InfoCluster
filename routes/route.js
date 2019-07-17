const bodyParser = require('body-parser')
const express = require('express');
const router = express.Router();
const database = require('../database');
const request = require('request');
const cheerio = require('cheerio');

var urlencodedParser = bodyParser.urlencoded({ extended: false });



router.get('/', (req, res) => {
  
  database.getLinks(function(result) {
      res.render("home", {links: result});
  });
});

router.post('/getTitle', urlencodedParser, function(req, res){

    var url = req.body.url.trim();
    
    database.checkExist(url, function(result) {

      var count = result.count; // count url that is the same in database

      request(url, function (error, response, body) {

          if (!error && response.statusCode == 200) {

            const $ = cheerio.load(body);
            var webpageTitle = $("title").text();
            var metaDescription =  $('meta[name=description]').attr("content");

            if (webpageTitle != undefined && webpageTitle.length >= 100){
              webpageTitle = webpageTitle.trim().substring(0, 100) + "...";
            }

            if (metaDescription != undefined && metaDescription.length >= 150){
              metaDescription = metaDescription.trim().substring(0, 150) + "...";
            }
            
            const webpage = {
              status: count == 0? "success" : "exist",
              title: webpageTitle,
              metaDescription: metaDescription
            }

            res.send(webpage);
          }else{
              res.send({
                  status: "fail"
              })
          }

      });
        
    });
    
});

router.post('/addLink', urlencodedParser, function(req, res){
  database.insertLink(req.body);
  res.redirect("/");
});

router.post('/editLink', urlencodedParser, function(req, res){
  database.updateLink(req.body);
  res.redirect("/");
});

router.post('/deleteLink', urlencodedParser, function(req, res){
  database.deleteLink(req.body);
  res.redirect("/"); // this line doesn't redirect on its own for some reason, need to combine with ajax success function
  // doesn't redirect becasue of the ajax post
  //https://stackoverflow.com/questions/27202075/expressjs-res-redirect-not-working-as-expected
});

router.post('/checkbox', urlencodedParser, function(req, res){
  database.checkbox(req.body);
  res.redirect("/");
});

router.post('/search', urlencodedParser, function(req, res){

  database.search(req.body, function(result) {
    console.log(result);
    res.render("home", {links: result});
  });
});

router.get('*', (req, res) => {
    res.send("404 page not found");
});



module.exports = router;