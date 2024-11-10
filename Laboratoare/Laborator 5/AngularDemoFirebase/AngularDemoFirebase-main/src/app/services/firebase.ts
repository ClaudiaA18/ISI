import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { Observable } from 'rxjs';

export interface IDatabaseItem {
    name: string;
    val: string;
}

export interface MapPoint {
    lat: number;
    lng: number;
}

@Injectable()
export class FirebaseService {

    listFeed: Observable<any[]>;
    objFeed: Observable<any>;

    constructor(public db: AngularFireDatabase) {

    }

    connectToDatabase() {
        this.listFeed = this.db.list('list').valueChanges();
        this.objFeed = this.db.object('obj').valueChanges();
    }

    getChangeFeedList() {
        return this.listFeed;
    }

    getChangeFeedObject() {
        return this.objFeed;
    }

    removeListItems() {
        this.db.list('list').remove();
    }

    addListObject(val: string) {
        let item: IDatabaseItem = {
            name: "test",
            val: val
        };
        this.db.list('list').push(item);
    }

    updateObject(val: string) {
        let item: IDatabaseItem = {
            name: "test",
            val: val
        };
        this.db.object('obj').set([item]);
    }

    // Adaugă un punct în Firebase
    addPoint(point: MapPoint): Promise<void> {
        const id = this.db.createPushId();
        return this.db.object(`/points/${id}`).set(point);
    }

    // Obține toate punctele din Firebase
    getPoints(): Observable<MapPoint[]> {
        return this.db.list<MapPoint>('/points').valueChanges();
    }

    // Actualizează poziția utilizatorului în Firebase
    updateUserPosition(userId: string, position: MapPoint): Promise<void> {
        return this.db.object(`/users/${userId}/position`).set(position);
    }
}
