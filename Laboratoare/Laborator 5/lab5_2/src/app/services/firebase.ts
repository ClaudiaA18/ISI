import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface IDatabaseItem {
    name: string;
    val: string;
}

@Injectable({
  providedIn: 'root'  // Correct place to provide the service at the root level
})
export class FirebaseService {

    listFeed: Observable<IDatabaseItem[]>;
    objFeed: Observable<IDatabaseItem>;

    constructor(public db: AngularFireDatabase) {
        // Constructor remains empty if only initializing the db reference
    }

    connectToDatabase() {
        this.listFeed = this.db.list<IDatabaseItem>('list').valueChanges().pipe(
            catchError(err => {
                console.error('Failed to fetch list from Firebase', err);
                return of([]); // Return an empty array or appropriate fallback value
            })
        );
        this.objFeed = this.db.object<IDatabaseItem>('obj').valueChanges().pipe(
            catchError(err => {
                console.error('Failed to fetch object from Firebase', err);
                return of({} as IDatabaseItem); // Return an empty object or appropriate fallback value
            })
        );
    }

    getChangeFeedList() {
        return this.listFeed;
    }

    getChangeFeedObject() {
        return this.objFeed;
    }

    removeListItems() {
        this.db.list('list').remove().catch(err => {
            console.error("Failed to remove items from list", err);
        });
    }

    addListObject(item: string): Promise<void> {
        return this.db.list('path_to_your_data').push(item)
            .then(() => console.log("Item added successfully"))
            .catch(err => {
                console.error("Failed to add item to list", err);
                throw err; // Ensure to re-throw the error after logging it.
            });
    }    

    updateObject(val: string) {
        let item: IDatabaseItem = {
            name: "test",
            val: val
        };
        this.db.object('obj').set(item).catch(err => {
            console.error("Failed to update object", err);
        });
    }
}
