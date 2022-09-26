import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
declare var google: any;


export class Employee{
  constructor(
    public id: string,
    public EmployeeName: string,
    public StarTimeUtc: Date,
    public EndTimeUtc: Date,
    public workingOn: string,
    public deletedOn: Date,
    public TotalTimeInMonth: number = 0
  ){
  }
}

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  employees :Employee[] = [];
  calculateDiff :Number = 0;
  
  employeeCal : Employee[] = [];
  totalHr: Number = 0;

  constructor(
    private httpCLient:HttpClient
  ) { }

  ngOnInit(): void {
    this.getEmployees();
  }

  buildChart(employees:Employee[]){
    var func=(chart:any)=>{
      var data = new google.visualization.DataTable();
      data.addColumn('string', 'Topping');
      data.addColumn('number', 'Slices');
      employees.forEach(item=>{
        data.addRows([
          [item.EmployeeName,item.TotalTimeInMonth]
        ]);
      });
      var options = null;
      chart().draw(data, options);
    }
    var chart =()=> new google.visualization.PieChart(document.getElementById('piechart'));
    var callback=()=>func(chart);
    google.charts.setOnLoadCallback(callback);
  }


  checkExist(em: Employee){
    var name = em.EmployeeName;
    return this.employeeCal.find(x => x.EmployeeName === name);
  }

  validateTime(e:Employee){
    if(e.EndTimeUtc>e.StarTimeUtc) return true;
    return false;
  }

  getEmployees(){
    this.httpCLient.get<any>('https://rc-vault-fap-live-1.azurewebsites.net/api/gettimeentries?code=vO17RnE8vuzXzPJo5eaLLjXjmRW07law99QTD90zat9FfOQJKKUcgQ==').subscribe(
      response => {
        console.log(response);
        this.employees = response;
        var indeks = 0;
        this.employees.forEach(element => {
          if(!this.checkExist(element)){
            this.employeeCal.push(element);
            indeks = this.employeeCal.findIndex(x => x.EmployeeName === element.EmployeeName);
            this.employeeCal[indeks].TotalTimeInMonth = 0;
            console.log(indeks); 
          }
          indeks = this.employeeCal.findIndex(x => x.EmployeeName === element.EmployeeName);
          if(this.validateTime(element))this.employeeCal[indeks].TotalTimeInMonth += this.calculatediff(element);            
        });
        this.employeeCal.sort((a,b)=>b.TotalTimeInMonth-a.TotalTimeInMonth);
        google.charts.load('current', {packages: ['corechart']});
        this.buildChart(this.employeeCal);
      }
    );
  }

  calculatediff(e :Employee){
    return Math.floor(Math.abs(Date.parse(e.EndTimeUtc.toString()) - Date.parse(e.StarTimeUtc.toString())) / 36e5);
  }

  getColor(e:Employee){
    return e.TotalTimeInMonth<100 ? 'orange' : 'white';
  }

}
