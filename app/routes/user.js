var express = require('express');
var router = express.Router();
var user_controller = require('../controllers/userController');

/* GET request for list users */
router.get('/', user_controller.usersList);

/* POST request for create user */
router.post('/', user_controller.usersCreate);

/* PUT request for modify user */
router.put('/', user_controller.usersModify);

/* DELETE request for login */
router.delete('/', user_controller.usersDelete);

module.exports = router;
