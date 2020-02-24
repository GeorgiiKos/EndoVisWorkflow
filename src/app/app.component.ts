import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'EndoVisWorkflow';

  public sortSurgeries(name: string, asc: boolean) {
    //this.child.sortSurgeries(name, asc);
  }
}
