'use strict';

/**
 * `check-role` policy
 */

module.exports = (policyContext, config, { strapi }) => {
    const isEligible = 
        policyContext.state.user && 
        policyContext.state.user.role.name == config.userRole

    if (isEligible) {
        return true;
    }

    return false;
};
