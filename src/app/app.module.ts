import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AggregateDataComponent } from './aggregate-data/aggregate-data.component';
import { AppComponent } from './app.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { ChartAreaComponent } from './chart-area/chart-area.component';
import { ControlPanelComponent } from './control-panel/control-panel.component';
import { DataService } from './services/data.service';
import { SurgeryListItemComponent } from './surgery-list-item/surgery-list-item.component';
import { SurgeryListComponent } from './surgery-list/surgery-list.component';


@NgModule({
  declarations: [
    AppComponent,
    SurgeryListComponent,
    SurgeryListItemComponent,
    BarChartComponent,
    ChartAreaComponent,
    ControlPanelComponent,
    AggregateDataComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
