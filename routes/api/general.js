import express from 'express';
import {sprintf} from 'sprintf-js';
import dbConn from '../../core/dbConn';
import {dbTblName, chart} from '../../core/config';
import strings from '../../core/strings';

const router = express.Router();

const priceProc = (req, res, next) => {
    const params = req.body;
    const binSize = params.binSize;
    const symbol = params.symbol;
    let startTime = params.startTime;
    let endTime = params.endTime;
    const timezone = params.timezone;
    const timeOffset = sprintf("%d:00:00", timezone);

    if (typeof endTime === 'undefined' || endTime == null) {
        endTime = new Date().toISOString();
    }
    if (typeof startTime === 'undefined' || startTime == null) {
        startTime = new Date(new Date(endTime).getTime() - 30 * 24 * 3600 * 1000).toISOString();
    }
    startTime = new Date(startTime).toISOString();
    endTime = new Date(endTime).toISOString();

    let sql = sprintf("SELECT COUNT(`timestamp`) `count` FROM `%s_%s` WHERE `symbol` = '%s' AND `timestamp` BETWEEN '%s' AND '%s';", dbTblName.tradeBucketed, binSize, symbol, startTime, endTime);
    dbConn.query(sql, null, (error, rows, fields) => {
        if (error) {
            res.status(200).send({
                result: strings.error,
                message: strings.unknownServerError,
                data: [],
            });
            return;
        }
        const cnt = rows[0].count;
        const step = cnt / chart.rowCount1;
        const timestampFormat = '%Y-%m-%dT%H:%i:%s.000Z';

        sql = sprintf("SELECT `timestamp`, AVG(`open`) `open` FROM (SELECT FLOOR((@row_number:=@row_number + 1)/%f) AS num, `timestamp`, `open` FROM (SELECT DATE_FORMAT(ADDTIME(STR_TO_DATE(`timestamp`, '%s'), '%s'), '%s') `timestamp`, `open` FROM `%s_%s` WHERE `symbol` = '%s' AND `timestamp` BETWEEN '%s' AND '%s' ORDER BY `timestamp`) `bd`, (SELECT @row_number:=0) `row_num`  ORDER BY `timestamp` ASC) `tmp` GROUP BY `num`;", step, timestampFormat, timeOffset, timestampFormat, dbTblName.tradeBucketed, binSize, symbol, startTime, endTime);
        dbConn.query(sql, null, (error, rows, fields) => {
            if (error) {
                res.status(200).send({
                    result: strings.error,
                    message: strings.unknownServerError,
                    data: [],
                });
                return;
            }

            res.status(200).send({
                result: strings.success,
                data: rows,
            });
        });
    });

};

// router.get('/price', priceProc);
router.post('/price', priceProc);

module.exports = router;
