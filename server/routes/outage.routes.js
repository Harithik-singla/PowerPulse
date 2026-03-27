const router = require('express').Router();
const { protect, requireRole } = require('../middleware/auth.middleware');
const {
  getOutages, createOutage, getOutage,
  upvoteOutage, updateStatus, getMyOutages
} = require('../controllers/outage.controller');

router.get('/',         getOutages);                              // public
router.get('/my',       protect, getMyOutages);                   // citizen
router.get('/:id',      getOutage);                               // public
router.post('/',        protect, requireRole('citizen'), createOutage);
router.patch('/:id/upvote',  protect, upvoteOutage);
router.patch('/:id/status',  protect, requireRole('operator','admin'), updateStatus);

module.exports = router;