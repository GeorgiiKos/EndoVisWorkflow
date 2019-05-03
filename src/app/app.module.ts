import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { SurgerylistComponent } from './surgerylist/surgerylist.component';


@NgModule({
  declarations: [
    AppComponent,
    SurgerylistComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
