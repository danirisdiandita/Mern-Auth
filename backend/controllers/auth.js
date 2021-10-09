const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");


exports.register = async(req, res, next) => {
    const { username, email, password } = req.body;


    try {
        const user = await User.create({
            username,
            email,
            password
        });


        // res.status(201).json({
        //     success: true,
        //     user
        // })

        sendToken(user, 201, res);

    } catch (error) {
        next(error);
    }
}

exports.login = async(req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new ErrorResponse("Please provide an email and password", 400))
            // res.status(400).json({ success: false, error: "Please Provide email and password" })
    }


    try {
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return next(new ErrorResponse("Invalid Credentials", 401))
                // res.status(400).json({ success: false, error: "Invalid Credentials" });
        }


        const isMatch = await user.matchPasswords(password);

        if (!isMatch) {
            return next(new ErrorResponse("Invalid Credentials", 401))
                // res.status(400).json({ success: false, error: "Invalid Credentials" });
        }


        // res.status(201).json({
        //     success: true,
        //     token: "tr34f3443fc",
        // })

        sendToken(user, 200, res);


    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        })
    }

};

exports.forgotpassword = (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(new ErrorResponse("Email could not be sent", 404))
        }

        const resetToken =
    } catch (error) {

    }
};

exports.resetpassword = (req, res, next) => {
    res.send("Reset Password Route")
};


const sendToken = (user, statusCode, res) => {
        const token = user.getSignedToken();
        res.status(statusCode).json({
            success: true,
            token
        })
    }
    // res.status(statusCode).json({
    //     success: true,
    //     token
    // })
    // }