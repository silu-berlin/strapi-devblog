'use strict';

/**
 * `timer-header` middleware
 */

module.exports = (config, { strapi }) => {
    return async (ctx, next) => {
        const start = Date.now();

        await next();

        const delta = Math.ceil(Date.now() - start);
        ctx.set('X-Response-Time', delta + "ms");
    }
};
