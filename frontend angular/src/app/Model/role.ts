export class Role {
    id: string;
    name: string;
    description: string;


    scopeParamRequired?: boolean;

    composite: boolean;
    clientRole?: Boolean;
    containerId: string;
    attributes: { [key: string]: string[] };
}
