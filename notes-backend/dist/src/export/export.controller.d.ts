import { ExportService } from './export.service';
import { Response } from 'express';
export declare class ExportController {
    private readonly exportService;
    constructor(exportService: ExportService);
    exportNote(userId: number, id: number, format: string, res: Response): Promise<void>;
}
