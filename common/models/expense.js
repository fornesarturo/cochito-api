'use strict';

module.exports = function(Expense) {

    Expense.getPeriods = async function (ctx) {
        const moment = require('moment');
        const AccessToken = Expense.app.models.AccessToken;
        let token;
        if (ctx.req.headers.authorization) token = ctx.req.headers.authorization
        else if (ctx.req.accessToken) token = ctx.req.accessToken.id
        else throw { status: 401, message: "Authorization required" };
        const user = await new Promise((resolve, reject) => {
            AccessToken.resolve(token, function (err, res) {
                if (err) return reject({ status: 500 });
                resolve(res);
            });
        })
        const expenses = await Expense.find({ where: { cochitoId: user.userId } });
        let uniquePeriods = expenses.map(expense => expense.period)
        uniquePeriods = uniquePeriods.filter((v, i) => uniquePeriods.indexOf(v) === i).sort((a, b) => b - a)
        const monthMapping = {
            '01': 'January',
            '02': 'February',
            '03': 'March',
            '04': 'April',
            '05': 'May',
            '06': 'June',
            '07': 'July',
            '08': 'August',
            '09': 'September',
            '10': 'October',
            '11': 'November',
            '12': 'December'
        };
        const result = uniquePeriods.map(value => {
            const id = value;
            const strVal = value.toString();
            const year = strVal.substr(0, 4);
            const month = strVal.substr(4);
            return { id, name: `${monthMapping[month]} ${year}` };
        })
        const currentDate = parseInt(moment().format('YYYYMM'));
        const i = result.findIndex(period => period.id === currentDate)
        if (i >= 0) {
            result[i].name = 'This month';
        } else {
            result.unshift({ id: currentDate, name: 'This month' });
        }
        return result;
    }

    Expense.remoteMethod(
        'getPeriods', {
            http: { verb: 'get' },
            accepts: { arg: 'ctx', type: 'object', http: { source: 'context' } },
            returns: { arg: 'periods', type: 'array', root: true }
        }
    )
};
