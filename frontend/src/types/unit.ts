export interface Unit {
    id: string;
    name: string;
    code: string;
    description?: string;
    parentId?: string;
    children?: Unit[];
}
