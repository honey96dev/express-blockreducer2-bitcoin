import express from 'express';
import indexRouter from './api/index';
import authRouter from './api/auth';

const router = express.Router();

router.use('/', indexRouter);
router.use('/auth', authRouter);

module.exports = router;
