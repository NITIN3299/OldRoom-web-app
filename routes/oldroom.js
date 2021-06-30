 var express=require("express");
 var router=express.Router();
 var item=require("../models/item");
 var middleware=require("../middleware");

 const https = require('https')
const qs = require('querystring')
// Middleware for body parsing
const parseUrl = express.urlencoded({ extended: false })
const parseJson = express.urlencoded({ extended: false })
const checksum_lib = require('../paytm/checksum')
const config = require('../paytm/config');
const { callback_url } = require("../config/keys");

//main page route
router.get("/",function(req,res){
    //get data from DB
    item.find({},function(err,allitems){
       // console.log(allitems);
        if(err){
            console.log(err);
        } else {
            res.render("items/oldroom",{items:allitems});
        }
    })
   // res.render("oldroom",{items:items});
});

//search bar
router.post("/search",function(req,res){
    console.log(req.body.sitem)
    let itempattern = new RegExp("^"+req.body.sitem)
  //  console.log("name:",itempattern);
    item.find({name:{$regex:itempattern}},function(err,searchitems){
      //  console.log(searchitems)
        if(err){
            console.log(err);
        }else{
            res.render("items/oldroom",{items:searchitems})
        }
    })
})

//new item route
router.get("/new",middleware.isLoggedIn,function(req,res){
    res.render("items/new");
});
//payment page
router.get("/payment",middleware.isLoggedIn,(req,res)=>{
    res.render("items/payment")
})
//route for making payment
router.post('/paynow', [parseUrl, parseJson], (req, res) => {
  if (!req.body.amount || !req.body.email || !req.body.phone) {
    res.status(400).send('Payment failed')
  } else {
    var params = {};
    params['MID'] = config.PaytmConfig.mid;
    params['WEBSITE'] = config.PaytmConfig.website;
    params['CHANNEL_ID'] = 'WEB';
    params['INDUSTRY_TYPE_ID'] = 'Retail';
    params['ORDER_ID'] = 'TEST_' + new Date().getTime();
    params['CUST_ID'] = 'customer_001';
    params['TXN_AMOUNT'] = req.body.amount.toString();
    params['CALLBACK_URL'] = callback_url;
    params['EMAIL'] = req.body.email;
    params['MOBILE_NO'] = req.body.phone.toString();


    checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {
      var txn_url = "https://securegw-stage.paytm.in/theia/processTransaction"; // for staging
      // var txn_url = "https://securegw.paytm.in/theia/processTransaction"; // for production

      var form_fields = "";
      for (var x in params) {
        form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
      }
      form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write('<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>');
      res.end();
    });
  }
})

//router for verifying payment
router.post('/callback', (req, res) => {
  var body = '';

  req.on('data', function (data) {
    body += data;
  });

  req.on('end', function () {
    var html = "";
    var post_data = qs.parse(body);

    // received params in callback
    console.log('Callback Response: ', post_data, "\n");


    // verify the checksum
    var checksumhash = post_data.CHECKSUMHASH;
    // delete post_data.CHECKSUMHASH;
    var result = checksum_lib.verifychecksum(post_data, config.PaytmConfig.key, checksumhash);
    console.log("Checksum Result => ", result, "\n");


    // Send Server-to-Server request to verify Order Status
    var params = { "MID": config.PaytmConfig.mid, "ORDERID": post_data.ORDERID };

    checksum_lib.genchecksum(params, config.PaytmConfig.key, function (err, checksum) {

      params.CHECKSUMHASH = checksum;
      post_data = 'JsonData=' + JSON.stringify(params);

      var options = {
        hostname: 'securegw-stage.paytm.in', // for staging
        // hostname: 'securegw.paytm.in', // for production
        port: 443,
        path: '/merchant-status/getTxnStatus',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': post_data.length
        }
      };


      // Set up the request
      var response = "";
      var post_req = https.request(options, function (post_res) {
        post_res.on('data', function (chunk) {
          response += chunk;
        });

        post_res.on('end', function () {
          console.log('S2S Response: ', response, "\n");

          var _result = JSON.parse(response);
          res.render('response', {
            'data': _result
          })
        });
      });

      // post the data
      post_req.write(post_data);
      post_req.end();
    });
  });
})

//show route
router.get("/:id",function(req,res){
    //find item with provided id
    item.findById(req.params.id).populate("comments").exec(function(err,founditem){
        if(err){
            console.log(err);
        } else{
            res.render("items/show",{item:founditem});
        }
    })
})
//post route
router.post("/",middleware.isLoggedIn,function(req,res){
    //get item from form and add to items array
    var name = req.body.name;
    var image = req.body.image;
    var desc = req.body.desciption;
    var price=req.body.price;
    var author={
        id:req.user._id,
        username:req.user.username
    }
    var newitem = {name: name,price:price, image: image,desciption:desc,author:author}
    //create a new item and save it to DB
    item.create(newitem,function(err,item){
        if(err){
            console.log(err);
        } else{
            res.redirect("/oldroom");
        }
    });    
});
//edit
router.get("/:id/edit",middleware.itemownershipcheck,function(req,res){
    item.findById(req.params.id,function(err,itemfound){
        if(err){
            console.log(err);
        }else{
            res.render("items/edit",{item:itemfound});
        }
    })   
})
//update route
router.put("/:id",middleware.itemownershipcheck,function(req,res){
    item.findByIdAndUpdate(req.params.id,req.body.item,function(err,updateditem){
        if(err){
            res.redirect('/oldroom');
        }else{
            res.redirect("/oldroom/" + req.params.id);
        }
    })
})
//delete route
router.delete("/:id",middleware.itemownershipcheck,function(req,res){
    item.findByIdAndRemove(req.params.id,function(err){
        if(err){
            res.redirect("/oldroom");
        }else{
            res.redirect("/oldroom");
        }
    })
})
//
module.exports = router;