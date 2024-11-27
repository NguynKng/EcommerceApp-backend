const userModel = require("../models/userModel")
const bcrypt = require("bcrypt")
const generateToken = require("../utils/generateToken")

const signup = async (req, res) => {
    try {
        const { email, firstName, lastName, password, confirmPassword, mobile } = req.body
        if(!email || !firstName || !lastName || !password || !confirmPassword)
            return res.status(400).json({success: false, message: "All fields are required."})

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!emailRegex.test(email))
            return res.status(400).json({success: false, message: "Invalid email, please enter a valid email."})
        else{
            const existingEmail = await userModel.findOne({email: email})
            if(existingEmail)
                return res.status(400).json({success: false, message: "Email already exists, please try another email."})
        }

        if (password.length < 6)
            return res.status(400).json({success: false, message: 'Password must be at least 6 characters long'})
        else{
            if (password !== confirmPassword)
                return res.status(400).json({success: false, message: 'Passwords do not match.'})
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new userModel({email, firstName, lastName, password: hashedPassword, mobile})
        await newUser.save()

        return res.status(200).json({success: true, message: "Create account successfully."})

    } catch(err) {
        console.error(err)
        return res.status(400).json({success: false, message: "Something went wrong."})
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body

        if(!email || !password)
            return res.status(400).json({success: false, message: "All fields are required."})
        
        const user = await userModel.findOne({email: email})
        const isMatch = await bcrypt.compare(password, user.password)

        if(user && isMatch) {
            const token = generateToken(user._id, res)

            return res.status(200).json({success: true, 
                user: 
                    {
                        _id: user?._id, 
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        email: user?.email,
                        mobile: user?.mobile,
                        token: token
                    }})
        } else {
            return res.status(404).json({success: false, message: "Your login credentials don't match an account in our system."})
        }

    } catch(err) {
        console.error(err)
        return res.status(400).json({success: false, message: "Something went wrong."})
    }
}

const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body

        if(!email || !password)
            return res.status(400).json({success: false, message: "All fields are required."})
        
        const admin = await userModel.findOne({ email: email })
        const isMatch = await bcrypt.compare(password, admin.password)

        if (admin.role !== 'admin')
            return res.status(400).json({success: false, message: "You are not an administrator."})

        if(admin && isMatch){
            const token = generateToken(user._id, res)
            return res.status(200).json({success: true, 
                user: 
                    {
                        _id: user?._id, 
                        firstName: user?.firstName,
                        lastName: user?.lastName,
                        email: user?.email,
                        mobile: user?.mobile,
                        token: token
                    }})
        } else {
            return res.status(404).json({success: false, message: "Your login credentials don't match an account in our system."})
        }
    } catch(err) {
        console.error(err)
        return res.status(400).json({success: false, message: "Something went wrong."})
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie('jwt-token')
        return res.status(200).json({message: "Logged out successfully.", success: true})
    } catch (error) {
        console.error("Error in logout controller:", error.message)
        return res.status(500).json({message:'Internal server error', success: false})
    }
}

module.exports = { signup, loginUser, logout, loginAdmin }