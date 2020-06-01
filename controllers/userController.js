const { validationResult } = require('express-validator');

exports.renderPageLogin = (req, res, next) => {
    res.render("login");
};


exports.login =  (req, res, next) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render("login", {
            errors: errors.array(), 
            old: req.body
        });
    }
    res.send("auth/login");
};