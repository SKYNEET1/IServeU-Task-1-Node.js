const { response } = require('express');
// const User = require('../model/users');
const {TranUser,User} = require('../model/users')

exports.detailTransaction = async (req, res) => {
    try {
        const { name, place, balance, transactionId, remark,accId } = req.body;

        // Validate required fields
        if (!name || !place  || !balance || !transactionId || !accId) {
            return res.status(400).json({
                success: 'false',
                message: 'All fields are required'
            });
        }

        let existingUser = await User.findOne({ transactionId })
        if (existingUser) {

            res.status(200).json({
                success:false,
                message:'please go to /existinguser to make transaction'
            })
        }

        

        const response = await User.create({ name, place, balance, transactionId, remark,accId })
        res.status(201).json({
            success: 'true',
            message: 'User created successfully',
            data: response,
        });
    
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: 'false',
            message: 'Server Error',
            error: err.message
        });
    }

}


exports.newTran = async (req, res) => {
    try {
        const { transactionId, ammount, upiId, app, accHolder,paymentMethod,category } = req.body;

        // Validate required fields
        if (!transactionId || !ammount || !upiId || !app || !accHolder || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Find existing user
        const existingUser = await User.findOne({ transactionId });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this transactionId'
            });
        }

        // Deduct balance
        existingUser.balance -= ammount;

        // Update daily and monthly spent
        const today = new Date();
        const currentDay = today.getDate();
        const currentMonth = today.getMonth();

        if (existingUser.transactionDate.getDate() === currentDay) {
            existingUser.dailySpent += ammount;
        } else {
            existingUser.dailySpent = ammount; // reset for new day
        }

        if (existingUser.transactionDate.getMonth() === currentMonth) {
            existingUser.monthlySpent += ammount;
        } else {
            existingUser.monthlySpent = ammount; // reset for new month
        }

        // Check spending limits
        if (existingUser.dailySpent > 1000 || existingUser.monthlySpent > 5000) {
            return res.status(400).json({
                success: false,
                message: 'Daily or monthly spending limit exceeded'
            });
        }

        existingUser.transactionDate = today;
        await existingUser.save();

        // Create TranUser entry
        const tranUser = await TranUser.create({
            user: existingUser._id,
            upiId,
            app,
            accHolder,
            name: existingUser.name,
            place: existingUser.place,
            ammount: ammount,
            balance: existingUser.balance,
            category,
            transactionId: existingUser.transactionId,
            remark: existingUser.remark,
            paymentMethod,
            dailySpent: existingUser.dailySpent,
            monthlySpent: existingUser.monthlySpent
        });

        res.status(201).json({
            success: true,
            message: 'Transaction recorded successfully',
            data: tranUser
        });

    } catch (err) {
        console.error("Error in newTran:", err);
        res.status(500).json({
            success: false,
            message: 'Server Error',
            error: err.message
        });
    }
};


exports.getAllUsers = async (req, res) => {
    try {
        const response = await User.find({ isDeleted: false });
        if (!response) {
            res.status(500)
                .json({
                    success: false,
                    message: "Unable to find any user transaction"
                })
        }
        res.status(200)
            .json({
                success: true,
                data: response,
                message: "Entries are fetched",
            })
    } catch (err) {
        console.log("error in getting data" + err)
        res.status(500)
            .json({
                success: false,
                message: "Entries are Not fetched",
            })
    }

}


exports.getReqUser = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const response = await User.find({ transactionId, isDeleted: false });
        if (!response) {
            res.status(500)
                .json({
                    success: false,
                    message: `Unable to find this ${transactionId} user transaction`
                })
        }
        res.status(200)
            .json({
                success: true,
                data: response,
                message: `User's -   transaction fetched successfully`,
            })
    } catch (err) {
        console.log("error in getting data" + err)
        res.status(500)
            .json({
                success: false,
                message: `Entries of the user could not be fetched`,
            })
    }

}


exports.updateUser = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const toBeUpdateValues = req.body;

        const allowedUpdate = ['remark'];
        const updateKeys = Object.keys(toBeUpdateValues);
        const isValidOrNot = updateKeys.every((key) => allowedUpdate.includes(key))
        if (!isValidOrNot) {
            res.status(500)
                .json({
                    success: false,
                    message: `Only remark and category can be edited`,
                })
        }

        const response = await User.findOneAndUpdate(
            { transactionId: transactionId },
            { $set: toBeUpdateValues },
            { new: true },
        )

        if (!response) {
            return res.status(500).json({
                success: false,
                message: `No transaction found with id ${transactionId}`
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction updated successfully",
            data: response
        });

    } catch (err) {
        console.log("error in updateing data" + err)
        res.status(200)
            .json({
                success: false,
                message: `updateing the user not possible`,
            })
    }
}


exports.deleteUser = async (req, res) => {
    try {
        const { transactionId } = req.params;
        const response = await User.findOneAndUpdate(
            { transactionId },
            { $set: { isDeleted: true } },
            { new: true }
        )

        if (!response) {
            return res.status(500).json({
                success: false,
                message: `No transaction found with id ${transactionId}`
            });
        }

        res.status(200).json({
            success: true,
            message: "Transaction deleted successfully",
            data: response
        })


    } catch (err) {
        console.log("error in deleteing data" + err)
        res.status(200)
            .json({
                success: false,
                message: `deleteing the user not possible`,
            })
    }
}