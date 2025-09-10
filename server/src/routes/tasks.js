const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { list, create, getTask, update, remove } = require('../controllers/taskController');

router.use(auth);
router.get('/', list);
router.post('/', create);
router.get('/:id', getTask);
router.put('/:id', update);
router.delete('/:id', remove);

module.exports = router;
