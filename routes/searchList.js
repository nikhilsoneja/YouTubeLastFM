var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {
    console.log(req);
    res.render('searchList', { type: req.query.type, keyword: req.query.keyword });
});

module.exports = router;
