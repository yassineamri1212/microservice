export class Offre {
    id!:bigint;
    date!:string;
    title!:string;
    idEntreprise!:bigint;
    description!:string;
    location!:string;
    remote!:string;
    easyApply:boolean =true;
}
