const mongoose = require('mongoose');


const dataController = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    accId: {
        type: Number,
        required: true,
        unique: true,
    },
    place: {
        type: String,
        required: true
    },
    // ammount: {
    //     type: Number,
    //     required: true
    // },
    balance: {
        type: Number,
        required: true,
        default: 0
    },
    // category: {
    //     type: String,
    //     required: true,
    //     enum: ['grocery', 'fuel', 'rent']
    // },
    transactionId: {
        type: String,
        required: true,
        unique: true,
    },
    remark: {
        type: String,
        required: true,
        default: "No remarks",
        maxlength: 100
    },
    transactionDate: {
        type: Date,
        default: Date.now
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    // paymentMethod: {
    //     type: String,
    //     required: true,
    //     enum: ['UPI', 'NEFT', 'IMPS'],
    // },
    // upiAccounts: {
    //     type: [upiSchema],
    //     default: [],
    // },
    dailySpent: {
        type: Number,
        default: 0
    },
    monthlySpent: {
        type: Number,
        default: 0
    },

}, { timestamps: true })


const tranUserSchema = mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    upiId: { type: String, required: true, maxlength: 5 },
    app: { type: String, enum: ['Google Pay', 'PhonePe', 'Paytm'], required: true },
    accHolder: { type: String, required: true },
    category: {
        type: String,
        required: true,
        enum: ['grocery', 'fuel', 'rent']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['UPI', 'NEFT', 'IMPS'],
    },
    name: String,
    place: String,
    ammount: Number,
    balance: Number,
    transactionId: String,
    remark: String,
    paymentMethod: String,
    dailySpent: Number,
    monthlySpent: Number,
}, { timestamps: true });



const User = mongoose.model('User', dataController);
const TranUser = mongoose.model('TranUser', tranUserSchema);

module.exports = { User, TranUser };