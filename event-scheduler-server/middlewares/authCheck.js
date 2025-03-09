
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');
const ErrorHandler = require('../middlewares/errorHandler');
const catchAsyncError = require('../middlewares/catchAsyncError');

exports.authCheck = catchAsyncError(async (req, res, next) => {
    let token;


    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(new ErrorHandler('Authentication failed. Please log in.', 401));
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SEC);

        const user = await User.findById(decodedToken.id).select('-password');

        if (!user) {
            return next(new ErrorHandler('User not found. Please log in again.', 401));
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new ErrorHandler('Token has expired. Please log in again.', 401));
        } else {
            return next(new ErrorHandler('Authentication failed. Please log in again.', 401));
        }
    }
});