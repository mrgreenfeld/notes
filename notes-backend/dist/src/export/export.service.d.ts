import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
export declare class ExportService {
    private prisma;
    constructor(prisma: PrismaService);
    exportNote(userId: number, noteId: number, format: string, res: Response): Promise<void>;
    private exportAsTxt;
    private exportAsJson;
}
