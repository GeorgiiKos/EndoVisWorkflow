import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DataService } from './services/data.service';
import { HttpClientModule } from '@angular/common/http';
import { SurgeryListComponent } from './surgery-list/surgery-list.component';
import { SurgeryListItemComponent } from './surgery-list-item/surgery-list-item.component';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { TimelineChartComponent } from './timeline-chart/timeline-chart.component';
import { TableComponent } from './table/table.component';
import { ChartAreaComponent } from './chart-area/chart-area.component';


@NgModule({
  declarations: [
    AppComponent,
    SurgeryListComponent,
    SurgeryListItemComponent,
    BarChartComponent,
    TimelineChartComponent,
    TableComponent,
    ChartAreaComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [DataService],
  bootstrap: [AppComponent]
})
export class AppModule { }
