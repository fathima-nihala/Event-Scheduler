const { register, login, logout, getUserProfile, makeAdmin, getAllUsers } = require('../Controllers/authController');
const { authCheck } = require('../middlewares/authCheck');
const router = require('express').Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').post(logout);
router.route('/me').get(authCheck, getUserProfile);
router.route('/user/:id/make-admin').put(authCheck, makeAdmin);
router.route('/all-users').get(authCheck, getAllUsers);


module.exports = router;