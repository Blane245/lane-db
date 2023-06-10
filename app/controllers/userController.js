var User = require('../models/user');
const { body, validationResult } = require('express-validator');
const { JsonWebToken } = require('jsonwebtoken');
var async = require('async');

//TODO implement administrator authentication

// List users GET request
exports.usersList = function(req, res, next) {

    async.parallel({
        users: function(callback) { 
            User.find({}, callback);
        },
    }, function (err, results){
        const usersList = [];
        const errors = [];
        if (err) {
            errors.push ({message: err.message});
            res.status(500).json(errors);
        } else {

            // includes builtin attributes  id, title, description, published, createdAt, updatedAt
            for (let i = 0; i < results.orgs.length; i++) {
                usersList.push (results.users[i]);
            }

            res.json(usersList);
        }
    })

};

// Handle user create form on POST
exports.usersCreate = [

    // validate and sanitize fields
    body('name', 'Name cannot be blank').trim().isLength({min: 1}).escape(),
    body('email').isEmail().withMessage('Not a valid email address'),
    body('isAdministrator').custom(async value => {
        if (value != 'yes' && value != 'no')
            throw new Error ('isAdministrator must be yes or no')
    }),

    // save the new user unless it's a duplicate
    (req, res, next) => {
        const errors = validationResult(req).array();
        User.findOne({'name': req.body.name}).then(user => {
            if (user) {
                errors.push({msg: `User ${req.body.name} already exists.`});
            }
        
            // create an organization object with escaped and trimmed data
            var newUser = new User (
                { name: req.body.name,
                    email: req.body.email,
                    isAdministrator: req.body.isAdministrator,
                 });

            // repost if any errors
            if (errors.length != 0) {
                res.status(400).json(errors);
            } else {

                // a user with a new name. save it
                newUser.save(function (err) {
                    if (err) { res.status(500).json([{msg: err.message}]);}

                    // the user has been created, send the signed json token
                    //const token = JsonWebToken.sign ({ name: newUser.name}, SECRET_JWT_CODE);
                    //TODO this is the wrong responder
                    res.json(
                        {message:
                            `User ${req.body.name} with email ${req.body.email} added. Administrative privileges: ${req.body.isAdministrator}`});
                });
            }
        });
    }
];

// user modify on PUT.
exports.usersModify = function(req, res, next) {
    res.statue(501).json({message: 'not implemented'})
};

// user delete on DELETE
exports.usersDelete = function(req, res, next) {
    res.statue(501).json({message: 'not implemented'})
};
