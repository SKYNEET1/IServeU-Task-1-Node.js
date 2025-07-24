const express = require('express');
const router = express.Router();

const {detailTransaction} = require('../controllers/dataController');
const {getAllUsers} = require('../controllers/dataController')
const {getReqUser} = require('../controllers/dataController')
const {updateUser} = require('../controllers/dataController')
const {deleteUser} = require('../controllers/dataController')
const {newTran} = require('../controllers/dataController')

router.post('/adddetails', detailTransaction);
router.post('/adddetails', detailTransaction);
router.get('/getalluser', getAllUsers);
router.get('/getAUser/:transactionId', getReqUser);
router.put('/updateuser/:transactionId', updateUser);
router.post('/newTran', newTran);

module.exports = router;