import { Injectable } from '@angular/core';     
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = 'https://localhost:7243';

  constructor(private http: HttpClient) {}

  // TODOS

  getTodos() {
    return this.http.get(`${this.baseUrl}/todoitems`);
  }

  getTodosByEmployee(employeeId: number) {
    return this.http.get(
      `${this.baseUrl}/todoitems/by-employee/${employeeId}`
    );
  }

  addTodo(todo: any) {
    return this.http.post(
      `${this.baseUrl}/todoitems`,
      todo
    );
  }

  updateTodo(id: number, todo: any) {
    return this.http.put(
      `${this.baseUrl}/todoitems/${id}`,
      todo
    );
  }

  deleteTodo(id: number) {
    return this.http.delete(
      `${this.baseUrl}/todoitems/${id}`
    );
  }

  // EMPLOYEES

  getEmployees() {
    return this.http.get(
      `${this.baseUrl}/employees`
    );
  }

  addEmployee(emp: any) {
    return this.http.post(
      `${this.baseUrl}/employees`,
      emp
    );
  }
}