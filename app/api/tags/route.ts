import { prisma } from '@/config'; // Import Prisma client
import { APIUtils } from '@/utils';

export async function GET() {
    try {
        const tags = await prisma.tag.findMany();

        return APIUtils.createNextResponse({
            success: true,
            status: 200,
            payload: { tags },
        });
    } catch (error: any) {
        APIUtils.logError(error);
        return APIUtils.createNextResponse({ success: false, status: 500, message: error.toString() });
    }
}
