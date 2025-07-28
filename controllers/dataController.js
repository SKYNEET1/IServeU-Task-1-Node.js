const { response } = require('express');
// const User = require('../model/users');
const { TranUser, User } = require('../model/users')

exports.detailTransaction = async (req, res) => {
    try {
        const { name, place, balance, transactionId, remark, accId, dailyLimit, monthlyLimit } = req.body;

        // Validate required fields
        if (!name || !place || !balance || !transactionId || !accId || !dailyLimit || !monthlyLimit) {
            return res.status(400).json({
                success: 'false',
                message: 'All fields are required'
            });
        }

        let existingUser = await User.findOne({ accId })
        if (existingUser) {

            res.status(200).json({
                success: false,
                message: 'please go to /existinguser to make transaction'
            })
        }

        const response = await User.create({ name, place, balance, transactionId, remark, dailyLimit, monthlyLimit, accId })
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
        const { transactionId, ammount, upiId, app, accHolder, paymentMethod, category, accId } = req.body;

        // Validate required fields
        if (!transactionId || !ammount || !upiId || !app || !accHolder || !paymentMethod || !accId) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Find existing user
        const existingUser = await User.findOne({ accId });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                message: 'User not found with this AccountId'
            });
        }

        // Deduct balance
        existingUser.balance -= ammount;
        await existingUser.save();


        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);

        const dailyTransaction = await TranUser.find({
            user: existingUser._id,
            createdAt: { $gte: todayStart, $lte: todayEnd }
        })
        // If todayEnd exceed then find will return a empty [] array.

        const dailySpent = dailyTransaction.reduce((sum, tran) => sum + tran.ammount, 0) + ammount

        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

        const monthlyTransactions = await TranUser.find({
            user: existingUser._id,
            createdAt: { $gte: monthStart, $lte: monthEnd }
        });
        // this search your db with the given date range and return all the documents that match the query.

        const monthlySpent = monthlyTransactions.reduce((sum, tran) => sum + tran.ammount, 0) + ammount
        // this add up all today's transaction amount and add the new transaction amount to the total.

        // what if today has ended
        // The query for today’s date will not find any entries (because it’s a new day and no transaction has happened yet).
        // The reduce function sums up an empty array, which gives 0.


        if (dailySpent + ammount > existingUser.dailyLimit) {
            return res.status(400).json({
                success: false,
                message: 'Daily spending limit exceeded'
            });
        }


        if (monthlySpent + ammount > existingUser.monthlyLimit) {
            return res.status(400).json({
                success: false,
                message: 'Monthly spending limit exceeded'
            });
        }

        existingUser.transactionDate = today;
        await existingUser.save();

        // Create TranUser entry
        const tranUser = await TranUser.create({
            user: existingUser._id,
            upiId,
            accId: existingUser.accId,
            app,
            accHolder,
            name: existingUser.name,
            place: existingUser.place,
            ammount: ammount,
            balance: existingUser.balance,
            category,
            transactionId,
            remark: existingUser.remark,
            paymentMethod,
            dailySpent: dailySpent,
            monthlySpent: monthlySpent,
            accId: existingUser.accId
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


exports.getAllTran = async (req, res) => {
    try {
        // const { accId } = req.params;
        const checkIsDeleted = await User.find({ isDeleted: false });
        if (!checkIsDeleted || checkIsDeleted.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No active user found',
            });
        }
        const accId = checkIsDeleted.map((aId) => {
            return aId.accId
        })
        const allTranj = await Promise.all(accId.map(async (accId) => {
            const trans = await TranUser.find({ accId }).sort({ date: -1 });
            return {
                accId,
                transactions: trans
            }
        }))

        // Remember that "When a map function is used to work on async data it returns a array of promise even if it looks like a array of object"

        const filtered = allTranj.filter(entry => entry.transactions.length > 0);

        if (filtered.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No transactions found for any user',
            });
        }
        res.status(200)
            .json({
                success: true,
                data: filtered,
                message: `User's -  All transaction fetched successfully`,
            })

    } catch (err) {
        console.log("error in getting data from transactions" + err)
        res.status(500)
            .json({
                success: false,
                message: "AccId is not fetched",
            })
    }

}

exports.getAllUsers = async (req, res) => {
    try {
        const response = await User.find({ isDeleted: false });
        if (response.length === 0) {
            // if !response then it will give u [] now it will give u null.
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
        const { accId } = req.params;
        const response = await User.find({ accId: accId, isDeleted: false });
        if (response.length === 0) {
            res.status(500)
                .json({
                    success: false,
                    message: `Unable to find this ${accId} user transaction`
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
        const { accId } = req.params;
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
            { accId: accId },
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
        const { accId } = req.params;
        const response = await User.findOneAndUpdate(
            { accId: accId },
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

// kapilash