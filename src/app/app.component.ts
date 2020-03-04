import { Component, ViewChild } from '@angular/core';
import { SurgeryListComponent } from './surgery-list/surgery-list.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EndoVisWorkflow';

  @ViewChild(SurgeryListComponent, { static: false })
  private child: SurgeryListComponent;

  public sortMetadata(column: string, asc: boolean) {
    this.child.sortMetadata(column, asc);
  }
}
