import express from 'express';
import {sprintf} from 'sprintf-js';
import dbConn from '../../core/dbConn';
import {dbTblName, chart, server} from '../../core/config';
import strings from '../../core/strings';

const router = express.Router();

const realProc = (req, res, next) => {
    const params = req.query;
    const binSize = req.params.binSize;
    const symbol = params.symbol;
    let startTime = params.startTime;
    let endTime = params.endTime;
    const timezone = params.timezone;

    const acceptSymbols = server.acceptSymbols;
    const acceptBinSize = ['1m', '5m', '1h'];

    if (acceptSymbols.indexOf(symbol) === -1) {
        res.status(200).send({
            result: strings.error,
            message: strings.symbolIsInvalid,
        });
        return;
    } else if (acceptBinSize.indexOf(binSize) === -1) {
        res.status(200).send({
            result: strings.error,
            message: strings.binSizeIsInvalid,
        });
        return;
    } else if (typeof timezone === 'undefined' || timezone == null) {
        res.status(200).send({
            result: strings.error,
            message: strings.timezoneIsInvalid,
        });
        return;
    }

    const timeOffset = sprintf("%d:00:00", timezone);

    if (typeof endTime === 'undefined' || endTime == null || endTime === 'null') {
        endTime = new Date().toISOString();
    }
    if (typeof startTime === 'undefined' || startTime == null || startTime === 'null') {
        startTime = new Date(new Date(endTime).getTime() - 30 * 24 * 3600 * 1000).toISOString();
    }
    startTime = new Date(startTime).toISOString();
    endTime = new Date(endTime).toISOString();

    let sql = sprintf("SELECT COUNT(`timestamp`) `cnt` FROM `%s_%s_%s` WHERE `timestamp` BETWEEN '%s' AND '%s';", dbTblName.fft, symbol, binSize, startTime, endTime);
    dbConn.query(sql, undefined, (error, results, fields) => {
        if (error) {
            console.error(error);
            res.send({
                result: strings.error,
                message: strings.unknownServerError,
            });
            return;
        }

        const timestampFormat = "%Y-%m-%dT%H:%i:%s.000Z";

        let step = parseInt(results[0]['cnt']) / chart.rowCount1;
        sql = sprintf("SELECT `timestamp`, AVG(`open`) `open`, AVG(`lowPass`) `lowPass`, AVG(`highPass`) `highPass` FROM (SELECT FLOOR((@row_number:=@row_number + 1)/%f) AS num, `timestamp`, `open`, `lowPass`, `highPass` FROM (SELECT `timestamp`, `open`, `lowPass`, `highPass` FROM `%s_%s_%s` WHERE `timestamp` BETWEEN '%s' AND '%s'  ORDER BY `timestamp`) `bd`, (SELECT @row_number:=0) `row_num`  ORDER BY `timestamp` ASC) `tmp` GROUP BY `num`;", step, dbTblName.fft, symbol, binSize, startTime, endTime);
        dbConn.query(sql, null, (error, results, fields) => {
            if (error) {
                console.log(error);
                res.send({
                    result: strings.error,
                    message: strings.unknownServerError,
                });
                return;
            }
            res.status(200).send({
                result: strings.success,
                data: results,
            });
        });
    });
};

const estimateProc = (req, res, next) => {

};

router.get('/real/:binSize', realProc);

module.exports = router;
