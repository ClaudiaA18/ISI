import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'; // Added for Angular Material
import { NgModule } from "@angular/core";

import { AppComponent } from "./app.component";
import { EsriMapComponent } from "./pages/esri-map/esri-map.component";
import { AppRoutingModule } from "./app-routing.module";

// Angular Material Modules
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

// Angular Flex-Layout
import { FlexLayoutModule } from '@angular/flex-layout';

import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    EsriMapComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule, // Make sure to import BrowserAnimationsModule
    AppRoutingModule,
    MatTabsModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule,
    FlexLayoutModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';