export const permissions = {
    // A user can review a property if they are NOT the owner of it
    canReviewProperty: (userId: string | undefined, propertyOwnerId: string) => {
        if (!userId) return false;
        return userId !== propertyOwnerId;
    },

    // A user can edit/delete a property if they ARE the owner of it
    canEditProperty: (userId: string | undefined, propertyOwnerId: string) => {
        if (!userId) return false;
        return userId === propertyOwnerId;
    },

    canDeleteProperty: (userId: string | undefined, propertyOwnerId: string) => {
        if (!userId) return false;
        return userId === propertyOwnerId;
    },

    // Role checks
    isOwner: (role: string | undefined) => role === "owner",
    isStudent: (role: string | undefined) => role === "student",
    isGuardian: (role: string | undefined) => role === "guardian",
};
