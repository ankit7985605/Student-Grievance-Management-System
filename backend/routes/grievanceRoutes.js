const express = require('express');
const router = express.Router();
const {
    createGrievance,
    getAllGrievances,
    getGrievanceById,
    updateGrievance,
    deleteGrievance,
    searchGrievances
} = require('../controllers/grievanceController');
const auth = require('../middleware/authMiddleware');

router.use(auth);

router.post('/', createGrievance);
router.get('/', getAllGrievances);
router.get('/search', searchGrievances);
router.get('/:id', getGrievanceById);
router.put('/:id', updateGrievance);
router.delete('/:id', deleteGrievance);

module.exports = router;
