import { APIUtils } from '@/utils';
import { NextRequest } from 'next/server';
import { TokenUtils } from '@/utils';
import { TokenType } from '@/types/constants';

const AuthorizationMiddleware = async (req: NextRequest) => {
    try {
        const token = req.headers.get('Authorization')?.split(' ')[1];

        if (!token) {
            return {
                success: false,
                response: APIUtils.createNextResponse({
                    success: false,
                    status: 401,
                    message: 'Authorization token is required',
                }),
            };
        }

        const user = await TokenUtils.verifyToken(token, TokenType.ACCESS);
        return { success: true, payload: user };
    } catch (error) {
        return { success: false };
    }
};

export default AuthorizationMiddleware;
