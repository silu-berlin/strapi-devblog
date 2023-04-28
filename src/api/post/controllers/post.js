'use strict';

/**
 * post controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::post.post', ({ strapi }) => ({

    // Method 1: Creating an entirely custom action
    async exampleAction(ctx) {
        await strapi.service('api::post.post').exampleService();
        try {
            ctx.body = 'ok';
        } catch (err) {
            ctx.body = err;
        }
    },

    // Lösung 1: worst
    // async find(ctx) {
    //     // fetch all posts, including the premium
    //     const { data, meta } = await super.find(ctx);
    //     if (ctx.state.user) {
    //         return { data, meta};
    //     }

    //     // not authenticated
    //     const filteredData = data.filter((post) => !post.attributes.premium);
    //     return { data: filteredData, meta};
    // },

    // Lösung 2: lade die daten, die wir wirklich brauchen
    // async find(ctx) {
    //     // request is authenticated
    //     const isRequestingNonPremium = ctx.query.filters && ctx.query.filters?.premium == false;
    //     if (ctx.state.user || isRequestingNonPremium) {
    //         return await super.find(ctx);
    //     }
    //     // request is public
    //     // call underlying service
    //     const { query } = ctx;
    //     const filteredPosts = await strapi.service('api::post.post').find({
    //         ...query,
    //         filters: {
    //             ...query.filters,
    //             premium: false
    //         }
    //     });

    //     const sanitizedPosts = await this.sanitizeOutput(filteredPosts, ctx);
    //     return this.transformResponse(sanitizedPosts)
    // },

    async find(ctx) {
        // request is authenticated // explicity requests premium posts only
        const isRequestingNonPremium = ctx.query.filters && ctx.query.filters?.premium == false;
        if (ctx.state.user || isRequestingNonPremium) {
            return await super.find(ctx);
        }
        // request is public
        const publicPosts = await strapi.service('api::post.post').findPublic(ctx.query);

        const sanitizedPosts = await this.sanitizeOutput(publicPosts, ctx);
        return this.transformResponse(sanitizedPosts)
    },

    // Method 3: Replacing a core action
    // async findOne(ctx) {
    //     const { id } = ctx.params;
    //     const { query } = ctx;

    //     const entity = await strapi.service('api::post.post').findOne(id, query);
    //     const sanitizedEntity = await this.sanitizeOutput(entity, ctx);

    //     return this.transformResponse(sanitizedEntity);
    // }
    // Method 3: Replacing a core action
    async findOne(ctx) {
        if (ctx.state.user) {
            return await super.findOne(ctx);
        }
        const { id } = ctx.params;
        const { query } = ctx;

        const postIfPublic = await strapi.service('api::post.post').findOneIfPublic({ id, query})

        const sanitizedEntity = await this.sanitizeOutput(postIfPublic, ctx);

        return this.transformResponse(sanitizedEntity);
    },

    async likePost(ctx) {
        const user = ctx.state.user;
        const postId = ctx.params.id;
        const { query } = ctx;

        const updatedPost = await strapi.service('api::post.post').likePost({
            postId, userId: user.id, query
        });

        const sanitizedEntity = await this.sanitizeOutput(updatedPost, ctx);
        return this.transformResponse(sanitizedEntity);
    }
}));
