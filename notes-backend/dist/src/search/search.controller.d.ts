import { PrismaService } from '../prisma/prisma.service';
export declare class SearchController {
    private prisma;
    constructor(prisma: PrismaService);
    search(userId: number, query: string): Promise<{
        query: string;
        results: ({
            tags: {
                name: string;
                id: number;
                userId: number;
                color: string | null;
            }[];
        } & {
            title: string;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            content: string | null;
            isImportant: boolean;
            isDeleted: boolean;
            deletedAt: Date | null;
            userId: number;
        })[];
        count: number;
    }>;
}
