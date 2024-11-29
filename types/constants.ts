export const VISITOR = 'VISITOR';
export const USER = 'USER';
export const ADMIN = 'ADMIN';

export enum TokenType {
    ACCESS = 'ACCESS',
    REFRESH = 'REFRESH',
}

export const REFRESH_TOKEN_COOKIE_NAME = 'REFRESH_TOKEN';

export enum APIPaths {
    USERS = '/api/users',
    SESSIONS = '/api/sessions',
    POSTS = '/api/posts',
    REPORTS = '/api/reports',
    RUNNERS = '/api/runners',
    TEMPLATES = '/api/templates',
    POST_RATINGS = '/api/ratings/posts',
    COMMENT_RATINGS = '/api/ratings/comments',
}

export enum HTTPMethods {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    PATCH = 'PATCH',
    DELETE = 'DELETE',
}
