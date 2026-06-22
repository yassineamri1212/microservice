export interface Items
{
    folders: Item[];
    files: Item[];
    path: any[];
}

export interface Item
{
    id?: string;
    folderId?: string;
    name?: string;
    createdBy?: string;
    createdAt?: string;
    modifiedAt?: string;
    size?: string;
    type?: string;
    contents?: string | null;
    description?: string | null;
    path?: string | null;
}


export interface Matiere
{
    id?: string;
    nom?: string;
    chapitres: Chapitres[];
    image?: string;
    classId?: string;
}

export interface Chapitres
{
    id?: string;
    id_matiere?: string;
    nom?: string;
    cours: Cours[];

}
export interface Cours
{
    id?: string;
    chapitre_id?: string;
    name?: string;
    createdAt?: string;
    type?: string;
    contents?: string | null;
    description?: string | null;
    path?: string | null;
}

