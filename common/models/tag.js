'use strict';

module.exports = function(Tag) {
    Tag.observe('before delete', function (ctx, next) {
        console.log('Going to delete %s matching %j',
            ctx.Model.pluralModelName,
            ctx.where);
        if (ctx.where.id != null) {
            const Expense = Tag.app.loopback.getModel("Expense");
            Expense.destroyAll({ tagId: ctx.where.id }, function (err, res) {
                if (err) return next(err);
                next();
            })
        } else {
            next({ status: 400, message: 'No multiple deletes allowed' });
        }
    });
};
