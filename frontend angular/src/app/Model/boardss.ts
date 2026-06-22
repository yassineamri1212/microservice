import {Label, List, Member} from "../modules/admin/scrumboard/scrumboard.models";
import {IBoard, ILabel} from "../modules/admin/scrumboard/scrumboard.types";


export class Boardss implements Required<IBoard> {
    id!:string;
    title:string;
    description!:string;
    members: any[] =[];
    lists: List[]=[];
    icon: string | null;
    labels: ILabel[];
    lastActivity: string | null;


    constructor(board: IBoard)
    {
        this.id = board.id || null;
        this.title = board.title;
        this.description = board.description || null;
        this.icon = board.icon || null;
        this.lastActivity = board.lastActivity || null;
        this.lists = [];
        this.labels = [];
        this.members = [];

        // Lists
        if ( board.lists )
        {
            this.lists = board.lists.map((list) =>
            {
                if ( !(list instanceof List) )
                {
                    return new List(list);
                }

                return list;
            });
        }

        // Labels
        if ( board.labels )
        {
            this.labels = board.labels.map((label) =>
            {
                if ( !(label instanceof Label) )
                {
                    return new Label(label);
                }

                return label;
            });
        }

        // Members
        if ( board.members )
        {
            this.members = board.members.map((member) =>
            {
                if ( !(member instanceof Member) )
                {
                    return new Member(member);
                }

                return member;
            });
        }
    }
}
