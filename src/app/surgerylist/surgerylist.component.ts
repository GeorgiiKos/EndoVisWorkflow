import { Component, OnInit } from '@angular/core';
import { Surgery } from '../surgery';
@Component({
  selector: 'app-surgerylist',
  templateUrl: './surgerylist.component.html',
  styleUrls: ['./surgerylist.component.css']
})
export class SurgerylistComponent implements OnInit {

  surgery: Surgery = {
    id: 1,
    name: 'Procto7'
    
  };
  
  constructor() { 
  
    
  }

  ngOnInit() {
    
  }

  
}
