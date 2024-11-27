import { NextRequest, NextResponse } from 'next/server';
import { routes } from '@/config';

const getRouteConfig = (req: NextRequest) => {
    const routePath = req.method + ' ' + req.nextUrl.pathname.split('?')[0];
    return routes[routePath];
};

export async function middleware(req: NextRequest) {
    const routeConfiguration = getRouteConfig(req);
    if (!routeConfiguration) return NextResponse.next();

    for (const middleware of routeConfiguration.middlewares) {
        const response = await middleware(req, routeConfiguration.schema);
        if (response) return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/api/:path*'],
};
