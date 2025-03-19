const router = require('express').Router();
const {
    createGlobalTask,
    getAllGlobalTasks,
    updateGlobalTask,
    deleteGlobalTask,
    createPrivateTask,
    getUserPrivateTasks,
    updatePrivateTask,
    deletePrivateTask,
    calculateSchedule
} = require("../Controllers/taskController");
const adminCheck = require('../middlewares/adminCheck');
const { authCheck } = require("../middlewares/authCheck");

router.route("/global").post(authCheck, adminCheck, createGlobalTask); 
router.route("/global").get(authCheck, getAllGlobalTasks); 
router.route("/global/:id").put(authCheck, adminCheck, updateGlobalTask); 
router.route("/global/:id").delete(authCheck, adminCheck, deleteGlobalTask); 

// Private Task Routes 
router.route("/private").post(authCheck, createPrivateTask); 
router.route("/private").get(authCheck, getUserPrivateTasks); 
router.route("/private/:id").put(authCheck, updatePrivateTask);
router.route("/private/:id").delete(authCheck, deletePrivateTask); 

router.route("/calculate-schedule").post(authCheck, calculateSchedule);


module.exports = router;