import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { NoteQueryDto } from './dto/note-query.dto';
export declare class NotesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: number, dto: CreateNoteDto): Promise<{
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
    }>;
    findAll(userId: number, query: NoteQueryDto): Promise<{
        data: ({
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(userId: number, id: number): Promise<{
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
    }>;
    update(userId: number, id: number, dto: UpdateNoteDto): Promise<{
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
    }>;
    remove(userId: number, id: number): Promise<{
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        isImportant: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: number;
    }>;
    toggleImportant(userId: number, id: number): Promise<{
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        isImportant: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: number;
    }>;
    getTrash(userId: number): Promise<({
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
    })[]>;
    restore(userId: number, id: number): Promise<{
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        isImportant: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: number;
    }>;
    permanentlyDelete(userId: number, id: number): Promise<{
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        isImportant: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: number;
    }>;
    saveDraft(userId: number, id: number, content: string): Promise<{
        title: string;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        content: string | null;
        isImportant: boolean;
        isDeleted: boolean;
        deletedAt: Date | null;
        userId: number;
    }>;
    private validateNoteOwnership;
}
