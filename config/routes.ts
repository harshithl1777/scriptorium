import { VISITOR, USER, ADMIN } from '@/types/constants';
import {
    PostsValidationSchema,
    RatingsValidationSchema,
    ReportsValidationSchema,
    RunnersValidationSchema,
    SessionsValidationSchema,
    TemplatesValidationSchema,
    UsersValidationSchema,
    UsersUpdateValidationSchema,
} from '@/types/validations';
import { RouteConfig } from '@/types/api';

const routesConfiguration: {
    [key: string]: {
        GET?: RouteConfig;
        POST?: RouteConfig;
        PUT?: RouteConfig;
        PATCH?: RouteConfig;
        DELETE?: RouteConfig;
    };
} = {
    '/api/health': {
        GET: {
            access: VISITOR,
            schema: null,
        },
    },
    '/api/users': {
        POST: {
            access: VISITOR,
            schema: UsersValidationSchema,
        },
    },
    '/api/users/:id': {
        GET: {
            access: USER,
            schema: null,
        },
        PUT: {
            access: USER,
            schema: UsersUpdateValidationSchema,
        },
        DELETE: {
            access: USER,
            schema: null,
        },
    },
    '/api/sessions': {
        GET: {
            access: VISITOR,
            schema: null,
        },
        POST: {
            access: VISITOR,
            schema: SessionsValidationSchema,
        },
        PUT: {
            access: VISITOR,
            schema: null,
        },
        DELETE: {
            access: USER,
            schema: null,
        },
    },
    '/api/templates': {
        GET: {
            access: VISITOR,
            schema: null,
        },
        POST: {
            access: USER,
            schema: TemplatesValidationSchema,
        },
    },
    '/api/templates/:id': {
        GET: {
            access: VISITOR,
            schema: null,
        },
        POST: {
            access: USER,
            schema: TemplatesValidationSchema,
        },
        PUT: {
            access: USER,
            schema: TemplatesValidationSchema,
        },
        DELETE: {
            access: USER,
            schema: null,
        },
    },
    '/api/posts': {
        GET: {
            access: VISITOR,
            schema: null,
        },
        POST: {
            access: USER,
            schema: PostsValidationSchema,
        },
    },
    '/api/posts/:id': {
        GET: {
            access: VISITOR,
            schema: null,
        },
        PUT: {
            access: USER,
            schema: PostsValidationSchema,
        },
        DELETE: {
            access: USER,
            schema: null,
        },
        PATCH: {
            access: ADMIN,
            schema: null,
        },
    },
    '/api/posts/:id/comments': {
        POST: {
            access: USER,
            schema: null,
        },
        GET: {
            access: VISITOR,
            schema: null,
        },
    },
    '/api/comments/:id': {
        GET: {
            access: VISITOR,
            schema: null,
        },
        PATCH: {
            access: ADMIN,
            schema: null,
        },
    },
    '/api/ratings/posts/:id': {
        POST: {
            access: USER,
            schema: RatingsValidationSchema,
        },
    },
    '/api/ratings/comments/:id': {
        POST: {
            access: USER,
            schema: RatingsValidationSchema,
        },
    },
    '/api/reports': {
        GET: {
            access: ADMIN,
            schema: null,
        },
        POST: {
            access: USER,
            schema: ReportsValidationSchema,
        },
    },
    '/api/runners': {
        POST: {
            access: VISITOR,
            schema: RunnersValidationSchema,
        },
    },
    '/api/tags': {
        GET: {
            access: VISITOR,
            schema: null,
        },
    },
};

export default routesConfiguration;
