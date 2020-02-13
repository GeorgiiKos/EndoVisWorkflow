import { Component } from '@angular/core';
import { SurgerylistComponent } from './surgerylist/surgerylist.component';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EndoVisWorkflow';
  @ViewChild(SurgerylistComponent, { static: false }) child: SurgerylistComponent;

  public sortSurgeries(name: string, asc: boolean) {
    this.child.sortSurgeries(name, asc);
  }
}
