import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable, of, switchMap, take, tap, throwError} from "rxjs";
import {Suivie} from "./Model/suivie";
import {Board, Card, Label, List} from "./modules/admin/scrumboard/scrumboard.models";
import {Boardss} from "./Model/boardss";

@Injectable({
  providedIn: 'root'
})
export class BoardssService {

    private _board: BehaviorSubject<Boardss | null>;
    private _boards: BehaviorSubject<Boardss[] | null>;
    private _card: BehaviorSubject<Card | null>;

    constructor(private httpClient: HttpClient) {
        this._board = new BehaviorSubject(null);
        this._boards = new BehaviorSubject(null);
        this._card = new BehaviorSubject(null);
    }

    private baseURL = "http://localhost:8085/bordss";

    get board$(): Observable<Boardss>
    {
        return this._board.asObservable();
    }

    /**
     * Getter for boards
     */
    get boards$(): Observable<Boardss[]>
    {
        return this._boards.asObservable();
    }

    getboardList(): Observable<Boardss[]>{
        return this.httpClient.get<Boardss[]>(`${this.baseURL}`);
    }

    createboardss(boardss: Boardss): Observable<Boardss>{
        return this.httpClient.post<Boardss>(`${this.baseURL}`, boardss);
    }

    getboardssById(id: bigint): Observable<Boardss>{
        return this.httpClient.get<Boardss>(`${this.baseURL}/${id}`);
    }

    g( boardss: Boardss): Observable<Boardss>{
        return this.httpClient.put<Boardss>(`${this.baseURL}`, boardss);
    }

    deleteboardss(id: bigint): Observable<Boardss>{
        return this.httpClient.delete<Boardss>(`${this.baseURL}/${id}`);
    }





    /**
     * Create list
     *
     * @param list
     */
    createList(list: List): Observable<List>
    {
        return this.httpClient.post<List>('api/apps/scrumboard/board/list', {list}).pipe(
            map(response => new List(response)),
            tap((newList) =>
            {
                // Get the board value
                const board = this._board.value;

                // Update the board lists with the new list
                board.lists = [...board.lists, newList];

                // Sort the board lists
                board.lists.sort((a, b) => a.position - b.position);

                // Update the board
                this._board.next(board);
            }),
        );
    }

    /**
     * Update the list
     *
     * @param list
     */
    updateList(list: List): Observable<List>
    {
        return this.httpClient.patch<List>('api/apps/scrumboard/board/list', {list}).pipe(
            map(response => new List(response)),
            tap((updatedList) =>
            {
                // Get the board value
                const board = this._board.value;

                // Find the index of the updated list
                const index = board.lists.findIndex(item => item.id === list.id);

                // Update the list
                board.lists[index] = updatedList;

                // Sort the board lists
                board.lists.sort((a, b) => a.position - b.position);

                // Update the board
                this._board.next(board);
            }),
        );
    }

    /**
     * Update the lists
     *
     * @param lists
     */
    updateLists(lists: List[]): Observable<List[]>
    {
        return this.httpClient.patch<List[]>('api/apps/scrumboard/board/lists', {lists}).pipe(
            map(response => response.map(item => new List(item))),
            tap((updatedLists) =>
            {
                // Get the board value
                const board = this._board.value;

                // Go through the updated lists
                updatedLists.forEach((updatedList) =>
                {
                    // Find the index of the updated list
                    const index = board.lists.findIndex(item => item.id === updatedList.id);

                    // Update the list
                    board.lists[index] = updatedList;
                });

                // Sort the board lists
                board.lists.sort((a, b) => a.position - b.position);

                // Update the board
                this._board.next(board);
            }),
        );
    }

    /**
     * Delete the list
     *
     * @param id
     */
    deleteList(id: string): Observable<boolean>
    {
        return this.httpClient.delete<boolean>('api/apps/scrumboard/board/list', {params: {id}}).pipe(
            tap((isDeleted) =>
            {
                // Get the board value
                const board = this._board.value;

                // Find the index of the deleted list
                const index = board.lists.findIndex(item => item.id === id);

                // Delete the list
                board.lists.splice(index, 1);

                // Sort the board lists
                board.lists.sort((a, b) => a.position - b.position);

                // Update the board
                this._board.next(board);
            }),
        );
    }



    /**
     * Create card
     *
     * @param card
     */
    createCard(card: Card): Observable<Card>
    {
        return this.httpClient.put<Card>('api/apps/scrumboard/board/card', {card}).pipe(
            map(response => new Card(response)),
            tap((newCard) =>
            {
                // Get the board value
                const board = this._board.value;

                // Find the list and push the new card in it
                board.lists.forEach((listItem, index, list) =>
                {
                    if ( listItem.id === newCard.listId )
                    {
                    }
                });

                // Update the board
                this._board.next(board);

                // Return the new card
                return newCard;
            }),
        );
    }

    /**
     * Update the card
     *
     * @param id
     * @param card
     */
    updateCard(id: string, card: Card): Observable<Card>
    {
        return this.board$.pipe(
            take(1),
            switchMap(board => this.httpClient.patch<Card>('api/apps/scrumboard/board/card', {
                id,
                card,
            }).pipe(
                map((updatedCard) =>
                {
                    // Find the card and update it
                    board.lists.forEach((listItem) =>
                    {
                        listItem.cards.forEach((cardItem, index, array) =>
                        {
                            if ( cardItem.id === id )
                            {
                            }
                        });
                    });

                    // Update the board
                    this._board.next(board);

                    // Update the card
                    this._card.next(updatedCard);

                    // Return the updated card
                    return updatedCard;
                }),
            )),
        );
    }

    /**
     * Update the cards
     *
     * @param cards
     */
    updateCards(cards: Card[]): Observable<Card[]>
    {
        return this.httpClient.patch<Card[]>('api/apps/scrumboard/board/cards', {cards}).pipe(
            map(response => response.map(item => new Card(item))),
            tap((updatedCards) =>
            {
                // Get the board value
                const board = this._board.value;

                // Go through the updated cards
                updatedCards.forEach((updatedCard) =>
                {
                    // Find the index of the updated card's list
                    const listIndex = board.lists.findIndex(list => list.id === updatedCard.listId);

                    // Find the index of the updated card
                    const cardIndex = board.lists[listIndex].cards.findIndex(item => item.id === updatedCard.id);

                    // Update the card

                    // Sort the cards
                });

                // Update the board
                this._board.next(board);
            }),
        );
    }

    /**
     * Delete the card
     *
     * @param id
     */
    deleteCard(id: string): Observable<boolean>
    {
        return this.board$.pipe(
            take(1),
            switchMap(board => this.httpClient.delete('api/apps/scrumboard/board/card', {params: {id}}).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the card and delete it
                    board.lists.forEach((listItem) =>
                    {
                        listItem.cards.forEach((cardItem, index, array) =>
                        {
                            if ( cardItem.id === id )
                            {
                                array.splice(index, 1);
                            }
                        });
                    });

                    // Update the board
                    this._board.next(board);

                    // Update the card
                    this._card.next(null);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }

    /**
     * Create label
     *
     * @param label
     */
    createLabel(label: Label): Observable<Label>
    {
        return this.board$.pipe(
            take(1),
            switchMap(board => this.httpClient.post<Label>('api/apps/scrumboard/board/label', {label}).pipe(
                map((newLabel) =>
                {
                    // Update the board labels with the new label
                    board.labels = [...board.labels, newLabel];

                    // Update the board
                    this._board.next(board);

                    // Return new label from observable
                    return newLabel;
                }),
            )),
        );
    }

    /**
     * Update the label
     *
     * @param id
     * @param label
     */
    updateLabel(id: string, label: Label): Observable<Label>
    {
        return this.board$.pipe(
            take(1),
            switchMap(board => this.httpClient.patch<Label>('api/apps/scrumboard/board/label', {
                id,
                label,
            }).pipe(
                map((updatedLabel) =>
                {
                    // Find the index of the updated label
                    const index = board.labels.findIndex(item => item.id === id);

                    // Update the label
                    board.labels[index] = updatedLabel;

                    // Update the board
                    this._board.next(board);

                    // Return the updated label
                    return updatedLabel;
                }),
            )),
        );
    }

    /**
     * Delete the label
     *
     * @param id
     */
    deleteLabel(id: string): Observable<boolean>
    {
        return this.board$.pipe(
            take(1),
            switchMap(board => this.httpClient.delete('api/apps/scrumboard/board/label', {params: {id}}).pipe(
                map((isDeleted: boolean) =>
                {
                    // Find the index of the deleted label
                    const index = board.labels.findIndex(item => item.id === id);

                    // Delete the label
                    board.labels.splice(index, 1);

                    // If the label is deleted...
                    if ( isDeleted )
                    {
                        // Remove the label from any card that uses it
                        board.lists.forEach((list) =>
                        {
                            list.cards.forEach((card) =>
                            {

                            });
                        });
                    }

                    // Update the board
                    this._board.next(board);

                    // Return the deleted status
                    return isDeleted;
                }),
            )),
        );
    }

    /**
     * Search within board cards
     *
     * @param query
     */
    search(query: string): Observable<Card[] | null>
    {
        // @TODO: Update the board cards based on the search results
        return this.httpClient.get<Card[] | null>('api/apps/scrumboard/board/search', {params: {query}});
    }
}
