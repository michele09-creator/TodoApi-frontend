import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from './api.service';
import {
 signal ,
 computed,
} from '@angular/core'
//bxqwbuon

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  employees: any[] = [];
  selectedEmployeeId: number | null = null;
  selectedFilterEmployeeId: number | null = null;
  todos: any[] = [];
  filteredList: any[] = [];

  today = new Date().toISOString().split('T')[0];

  newTodo = '';
  newDescription = '';
  newDeadline = '';
  newIsComplete = false;
  newPriority = 50;
  editingId: number | null = null;
  editedName = '';
  editedIsComplete = false;
  editedPriority = 50;
  editedDescription = '';
  editedDeadline = '';
  editedEmployeeId: number | null = null;
  employeeForm = signal({
    name: '',
    email: '',
    codiceFiscale: '',
    Residenza: ''
  });
  nameValid = computed(() =>
    /^[A-Za-zÀ-ÖØ-öø-ÿ\s]{2,50}$/
      .test(this.employeeForm().name)
  );

  emailValid = computed(() =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(this.employeeForm().email)
  );

  cfValid = computed(() =>
    /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/
      .test(
        this.employeeForm()
          .codiceFiscale
          .toUpperCase()
      )
  );

  employeeFormValid = computed(() =>
    this.nameValid() &&
    this.emailValid() &&
    this.cfValid()
  );


  filter: 'all' | 'todo' | 'done' | 'expired' | 'urgent' = 'all';
  searchText = '';
  countAll(): number {
    return this.todos.length;
  }

  countTodo(): number {
    return this.todos.filter(t => !t.isComplete).length;
  }

  countDone(): number {
    return this.todos.filter(t => t.isComplete).length;
  }

  countExpired(): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);


    return this.todos.filter(t => {
      if (!t.deadline || t.isComplete) return false;

      const deadline = new Date(t.deadline);
      deadline.setHours(0, 0, 0, 0);

      return deadline < today;
    }).length;
  }
  countUrgent(): number {
    return this.todos.filter(t =>
      t.priority >= 80 && !t.isComplete
    ).length;
  }
  constructor(private api: ApiService) { }

  ngOnInit() {
    this.loadTodos();
    this.loadEmployees();
  }

  loadTodos() {
    this.api.getTodos().subscribe((res: any) => {

      this.todos = res.sort((a: any, b: any) => {

        if (!a.deadline) return 1;
        if (!b.deadline) return -1;

        return new Date(a.deadline).getTime() -
          new Date(b.deadline).getTime();
      });

      this.applyFilter();
    });
  }
  addTodo() {

    if (!this.selectedEmployeeId) {
      alert("Seleziona un employee");
      return;
    }

    this.api.addTodo({
      name: this.newTodo,
      description: this.newDescription,
      deadline: this.newDeadline,
      isComplete: this.newIsComplete,
      priority: this.newPriority,
      employeeId: this.selectedEmployeeId ?? 0
    })
      .subscribe(() => {
        this.resetForm();
        this.loadTodos();
      });
  }

  startEdit(todo: any) {
    this.editingId = todo.id;
    this.editedName = todo.name;
    this.editedDescription = todo.description;
    this.editedDeadline = todo.deadline;
    this.editedIsComplete = todo.isComplete;
    this.editedPriority = todo.priority;
    this.editedEmployeeId = todo.employeeId;
  }
  saveEdit(todo: any) {

    this.api.updateTodo(todo.id, {
      name: this.editedName,
      description: this.editedDescription,
      deadline: this.editedDeadline,
      isComplete: this.editedIsComplete,
      priority: this.editedPriority,
      employeeId: this.editedEmployeeId
    })
      .subscribe(() => {

        this.editingId = null;

        this.loadTodos();

      });

  }
  cancelEdit() {
    this.editingId = null;
  }

  deleteTodo(id: number, nome: string) {

    const conferma = confirm(
      `⚠️ Vuoi davvero eliminare "${nome}"?`
    );

    if (!conferma) return;

    this.api.deleteTodo(id).subscribe(() => {
      this.loadTodos();
    });
  }
  addEmployee() {

    if (!this.employeeFormValid()) {
      alert('Compila correttamente il form');
      return;
    }

    const form = this.employeeForm();

    this.api.addEmployee({

      name: form.name.trim(),

      email: form.email.trim(),

      codiceFiscale: form.codiceFiscale.toUpperCase(),

      Residenza: form.Residenza.trim()

    })
      .subscribe(() => {

        // reset form (Signal)
        this.employeeForm.set({
          name: '',
          email: '',
          codiceFiscale: '',
          Residenza: ''
        });

        this.loadEmployees();

      });

  }
  loadEmployees() {
    this.api.getEmployees().subscribe((res: any) => {
      this.employees = res;
    });
  }
  private resetForm() {
    this.newTodo = '';
    this.newDescription = '';
    this.newDeadline = '';
    this.newIsComplete = false;
    this.newPriority = 50;
  }

  // 🔥 FILTRI
  setFilter(value: 'all' | 'todo' | 'done' | 'expired' | 'urgent') {
    this.filter = value;
    this.applyFilter();
  }

  applyFilter() {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    this.filteredList = this.todos.filter(t => {

      const deadline = t.deadline ? new Date(t.deadline) : null;
      if (deadline) deadline.setHours(0, 0, 0, 0);

      switch (this.filter) {

        case 'todo':
          return !t.isComplete;

        case 'done':
          return t.isComplete;

        case 'expired':
          return deadline && deadline < today && !t.isComplete;

        // 🔥 NUOVO FILTRO URGENTI
        case 'urgent':
          return t.priority >= 80 && !t.isComplete;

        default:
          return true;
      }
    });
  }

  // 🎨 COLORI SCADENZE
  getDeadlineClass(todo: any): string {

    if (!todo.deadline) {
      return 'no-deadline';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(todo.deadline);
    deadline.setHours(0, 0, 0, 0);

    if (deadline < today) return 'expired';
    if (deadline.getTime() === today.getTime()) return 'today';

    return 'future';
  }
  getPriorityClass(todo: any): string {

    if (todo.priority < 40) return 'priority-low';
    if (todo.priority < 70) return 'priority-medium';

    return 'priority-high';
  }
  applysearchFilter() {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const search = (this.searchText || '').trim().toLowerCase();

    this.filteredList = this.todos.filter(t => {

      // 🔍 SEARCH SICURA
      const name = (t.name || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();

      const matchesSearch =
        search === '' ||
        name.includes(search) ||
        desc.includes(search);

      if (!matchesSearch) return false;

      // 📅 STATUS FILTER
      const deadline = t.deadline ? new Date(t.deadline) : null;
      if (deadline) deadline.setHours(0, 0, 0, 0);

      if (this.filter === 'todo') return !t.isComplete;
      if (this.filter === 'done') return t.isComplete;

      if (this.filter === 'expired') {
        return deadline && deadline < today && !t.isComplete;
      }

      if (this.filter === 'urgent') {
        return t.priority >= 80 && !t.isComplete;
      }

      return true;
    });
  }
  filterByEmployee() {

    if (!this.selectedFilterEmployeeId) {
      this.loadTodos();
      return;
    }

    this.api
      .getTodosByEmployee(this.selectedFilterEmployeeId)
      .subscribe((res: any) => {

        this.todos = res;
        this.applyFilter();
      });
  }
  updateEmployeeField(field: string, value: string) {
    this.employeeForm.update(f => ({
      ...f,
      [field]: value
    }));
  }


}