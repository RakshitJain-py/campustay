export const permissions = {
    // A user can review a property if they are NOT the owner AND they are a student or guardian
    canReviewProperty: (userId: string | undefined, propertyOwnerId: string, role: string | undefined) => {
        if (!userId) return false;
        if (userId === propertyOwnerId) return false;
        return role === "student" || role === "guardian";
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
    isOwner: (role: string | undefined) => role === "hostel_owner",
    isStudent: (role: string | undefined) => role === "student",
    isGuardian: (role: string | undefined) => role === "guardian",
};
