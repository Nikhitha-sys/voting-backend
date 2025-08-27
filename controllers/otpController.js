// controllers/otpController.js
import Otp from "../models/Otp.js";
import nodemailer from 'nodemailer';

// This function will only be used if you have a separate endpoint for requesting OTPs
export const requestOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP for Voting System',
            html: `Your One-Time Password (OTP) is <b>${otp}</b>. It is valid for 10 minutes.`,
        };

        await Otp.findOneAndUpdate(
            { email },
            { otp, expiresAt },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        await transporter.sendMail(mailOptions);
        console.log("OTP email sent successfully");

        res.status(200).json({ message: "OTP sent successfully" });

    } catch (err) {
        console.error("Error sending OTP email:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

// This is the correct verify OTP function for a separate route
export const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const otpDoc = await Otp.findOne({ email, otp });

        if (!otpDoc || otpDoc.expiresAt < Date.now()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }

        await Otp.deleteOne({ _id: otpDoc._id });
        res.status(200).json({ message: "OTP verified successfully" });
    } catch (err) {
        console.error("Error verifying OTP:", err);
        res.status(500).json({ message: "Server error", error: err.message });
    }
};