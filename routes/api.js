import express from 'express';
import indexRouter from './api/index';
import authRouter from './api/auth';
import generalRouter from './api/general';
import volatilityRouter from './api/volatility';
import marketSentimentRouter from './api/marketSentiment';
import exchangeInfoRouter from './api/exchangeInfo';
import deribitRouter from './api/deribit';

const router = express.Router();

router.use('/', indexRouter);
router.use('/auth', authRouter);
router.use('/general', generalRouter);
router.use('/volatility', volatilityRouter);
router.use('/market-sentiment', marketSentimentRouter);
router.use('/exchange-info', exchangeInfoRouter);
router.use('/deribit', deribitRouter);

module.exports = router;
