import { VISITOR, USER, ADMIN } from '@/types/constants';
import ValidationMiddleware from '@/middleware/validation';
import { POSTUsersValidationSchema } from '@/types/validations';
import { z } from 'zod';

const routesConfiguration: {
    [key: string]: {
        access: typeof VISITOR | typeof USER | typeof ADMIN;
        schema: z.AnyZodObject;
        middlewares: Array<Function>;
    };
} = {
    'POST /api/users': {
        access: VISITOR,
        schema: POSTUsersValidationSchema,
        middlewares: [ValidationMiddleware],
    },
};

export default routesConfiguration;
