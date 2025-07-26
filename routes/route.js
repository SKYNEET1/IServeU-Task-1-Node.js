const express = require('express');
const router = express.Router();

const {detailTransaction} = require('../controllers/dataController');
const {getAllUsers} = require('../controllers/dataController')
const {getReqUser} = require('../controllers/dataController')
const {updateUser} = require('../controllers/dataController')
const {deleteUser} = require('../controllers/dataController')
const {newTran} = require('../controllers/dataController')
const {getAllTran} = require('../controllers/dataController')

router.post('/adddetails', detailTransaction);
router.patch('/deleteUser/:accId', deleteUser);
router.get('/getalluser', getAllUsers);
router.get('/getAUser/:accId', getReqUser);
router.put('/updateuser/:accId', updateUser);
router.post('/newTran', newTran);
router.get('/getalltran', getAllTran);


module.exports = router;