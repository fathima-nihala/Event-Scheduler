const catchAsyncError = require("../middlewares/catchAsyncError");
const errorHandler = require("../middlewares/errorHandler");
const User = require("../Models/userModel");
const sendToken = require("../utils/sendToken");

exports.register = catchAsyncError(async (req, res, next) => {
    const { name,  email,  password } = req.body;


    if (!name || !email || !password) {
        return next(new errorHandler('Please enter all required fields', 400));
    }

    try {
        const user = await User.create({
            name,
            email,
            password,
        });

        res.status(201).json({
            success: true,
            message: "Registered Successfully!",
            user: {
                _id: user._id,
                email: user.email
            }
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return next(new errorHandler(messages.join(', '), 400));
        }
        next(error);
    }
});

exports.login = catchAsyncError(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new errorHandler('Please enter email and password', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.isValidPassword(password))) {
        return next(new errorHandler('Invalid email or password', 401));
    }

    sendToken(user, 200, res);
});

exports.logout = catchAsyncError(async (req, res, next) => {
    res.cookie('token', null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
        .status(200)
        .json({
            success: true,
            message: "Logged out successfully!"
        });
});


exports.getUserProfile = catchAsyncError(async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return next(new errorHandler("User not found", 404));
        }
        res.status(200).json({
            statusCode: 200,
            success: true,
            message: "User Details",
            user
        });
    } catch (error) {
        next(error); 
    }
});


//make admin
exports.makeAdmin = catchAsyncError(async (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: "Access Denied! Only admins can perform this action." });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
        return res.status(404).json({ message: "User not found!" });
    }

    user.isAdmin = true;
    await user.save();

    res.status(200).json({ success: true, message: "User is now an admin!" });
});


//get all users
exports.getAllUsers = catchAsyncError(async (req, res, next) => {
    try {

        if (!req.user.isAdmin) {
            return res.status(403).json({ message: "Access Denied! Only admins can perform this action." });
        }

        const users = await User.find().select("-password"); 

        res.status(200).json({
            success: true,
            message: "All Users Retrieved Successfully!",
            length: users.length,
            users
        });
    } catch (error) {
        next(error);
    }
});
