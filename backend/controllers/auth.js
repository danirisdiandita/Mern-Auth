const crypto = require("crypto");
const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const sendEmail = require("../utils/sendEmail");


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

exports.forgotpassword = async(req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return next(new ErrorResponse("Email could not be sent", 404))
        }

        const resetToken = user.getResetPasswordToken();

        await user.save();

        const resetUrl = `${process.env.FRONT_END_URL}/passwordreset/${resetToken}`;

        const message = `
            <h1>You have requested a password reset</h1>
            <p>Please go to this link to reset your password</p>
            <a href=${resetUrl} clicktracking=off>${resetUrl}</a> 
        `

        try {
            res.status(201).json({
                success: true,
                resetUrl,
                resetToken
            })
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            return next(new ErrorResponse("Link can't be sent"))
        }

        // try {

        //     await sendEmail({
        //         to: user.email,
        //         subject: "Password Reset Request",
        //         text: message
        //     });

        //     res.status(200).json({
        //         success: true,
        //         data: "Email sent"
        //     })

        // } catch (error) {
        //     user.resetPasswordToken = undefined;
        //     user.resetPasswordExpire = undefined;
        //     await user.save();

        //     return next(new ErrorResponse("Email could not be send", 500))
        // }
    } catch (error) {
        next(error);

    }
};

exports.resetpassword = async(req, res, next) => {
    console.log(req.params.resetToken);
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");


    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        })

        if (!user) {
            return next(new ErrorResponse("Invalid Reset Token", 400))
        }

        user.password = req.body.password;
        user.resetPasswordExpire = undefined;
        user.resetPasswordToken = undefined;
        await user.save();

        res.status(201).json({
            success: true,
            data: "Password Reset Success"
        })
    } catch (error) {
        next(error);
    }
};


const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({
        success: true,
        token
    })
}