import { errorResponse } from '../utils/responseFormatter.js';

const ROLE_HIERARCHY = {
  OWNER: 4,
  ADULT_MEMBER: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export const requireFamilyRole = (minimumRole = 'MEMBER') => {
  return (req, res, next) => {
    if (!req.familyRole) {
      return errorResponse(res, 'Family role could not be determined.', 403, [], 'ROLE_UNDETERMINED');
    }

    const userLevel = ROLE_HIERARCHY[req.familyRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;

    if (userLevel < requiredLevel) {
      return errorResponse(
        res,
        `Permission denied. Requires ${minimumRole} privileges or higher.`,
        403,
        [],
        'INSUFFICIENT_FAMILY_ROLE'
      );
    }

    next();
  };
};
