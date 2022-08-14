const express = require('express');
const {
    getAllAdmins,
    adminCreateAdmin,
    adminAddAdmin,
    getAdmin,
    deleteAdmin,
    updateAdmin,
    checkAdmin,
    createSuperAdmin,
} = require('../controllers/adminController');
const router = express.Router();

router.route('/').get(getAllAdmins).post(adminCreateAdmin);

router.route('/super').post(createSuperAdmin);

router
    .route('/:userId')
    .get(getAdmin)
    .put(updateAdmin)
    .delete(deleteAdmin)
    .post(checkAdmin);

module.exports = router;
