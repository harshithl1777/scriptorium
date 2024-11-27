import { APIHelper } from '@/utils/helpers';
import { NextRequest } from 'next/server';
import { z } from 'zod';

const ValidationMiddleware = async (req: NextRequest, schema: z.AnyZodObject) => {
    try {
        const body = await req.json();
        schema.parse(body);
    } catch {
        return APIHelper.createNextResponse({
            success: false,
            status: 400,
            message: 'Bad request: route has missing or badly formatted parameters',
        });
    }
};

export default ValidationMiddleware;
