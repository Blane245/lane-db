var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController');

/* GET request for list users */
router.get('/users', user_controller.usersList);

/* POST request for create user */
router.post('/users', user_controller.usersCreate);

/* PUT request for modify user */
router.put('/users', user_controller.usersModify);

/* DELETE request for login */
router.delete('/users', user_controller.usersDelete);

module.exports = router;
