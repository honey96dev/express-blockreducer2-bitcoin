import express from 'express';
import indexRouter from './api/index';
import authRouter from './api/auth';
import generalRouter from './api/general';

const router = express.Router();

router.use('/', indexRouter);
router.use('/auth', authRouter);
router.use('/general', generalRouter);

module.exports = router;
