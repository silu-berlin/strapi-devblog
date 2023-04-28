module.exports = {
    beforeCreate: async ({params}) => {
        // find the admin user who is about to create the post
        const adminUserId = params.data.createdBy;

        // find the corresponding author
        const author = (
            await strapi.entityService.findMany("api::author.author", {
                filters: {
                    admin_user: [adminUserId]
                }
            })
        )[0];

        // update the data payload of the request for creating the new post
        // by adding the author to the authors relation field
        params.data.authors.connect = [...params.data.authors.connect, author.id]
    }
}