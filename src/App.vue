<template>
  <v-app>
    <v-main>
      <v-container class="container-fluid">
        <!-- Login form -->
        <div v-if="!user" class="row justify-content-center mt-5">
          <div class="col-md-6">
            <div class="card shadow">
              <div class="card-header bg-primary text-white text-center">Login</div>
              <div class="card-body">
                <form @submit.prevent="handleLogin">
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input v-model="loginForm.email" type="email" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input v-model="loginForm.password" type="password" class="form-control" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100">Login</button>
                </form>
                <div v-if="loginError" class="alert alert-danger mt-3">{{ loginError }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Dashboard -->
        <div v-else>
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div class="container-fluid">
              <a class="navbar-brand" href="#">Admin Dashboard</a>
              <button class="btn btn-outline-light" @click="handleLogout">Logout</button>
            </div>
          </nav>

          <!-- Employee Management Section -->
          <div class="card shadow mb-4">
            <div class="card-header bg-primary text-white">Manage Employees</div>
            <div class="card-body">
              <!-- Button to open the employee form -->
              <button class="btn btn-success mb-3" @click="openEmployeeForm">+ Create New Employee</button>
              <input v-model="searchQuery" class="form-control mb-3" placeholder="Search Employees">

              <!-- Employee Table -->
              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <tr>
                    <th @click="sort('id')">ID</th>
                    <th @click="sort('employeename')">Employee Name</th>
                    <th @click="sort('age')">Age</th>
                    <th @click="sort('phone')">Phone</th>
                    <th @click="sort('createdatetime')">Created</th>
                    <th @click="sort('updatedatetime')">Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="employee in filteredEmployees" :key="employee.id">
                    <td>{{ employee.id }}</td>
                    <td>{{ employee.employeename }}</td>
                    <td>{{ employee.age }}</td>
                    <td>{{ employee.phone }}</td>
                    <td>{{ formatDate(employee.createdatetime) }}</td>
                    <td>{{ formatDate(employee.updatedatetime) }}</td>
                    <td>
                      <button class="btn btn-sm btn-primary me-2" @click="editEmployee(employee)">Edit</button>
                      <button class="btn btn-sm btn-danger" @click="deleteEmployee(employee.id)">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yrtaklxwrlbatvigvlnl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydGFrbHh3cmxiYXR2aWd2bG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Mjc5MDIsImV4cCI6MjA1MzEwMzkwMn0.8L1UX5CqFYjkr-yznH_nm57fvTcIKAzLbm1-qPnsTfk';
const supabase = createClient(supabaseUrl, supabaseKey);

export default {
  data() {
    return {
      user: null,
      loginForm: { email: '', password: '' },
      loginError: null,
      employees: [],
      searchQuery: '',
      sortKey: 'id',
      sortOrder: 'asc',
      showEmployeeForm: false,
      isEditing: false,
      employeeForm: { id: null, employeename: '', age: '', phone: '' }
    };
  },
  async created() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      this.user = session.user;
      await this.fetchEmployees();
    }
  },
  methods: {
    async handleLogin() {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: this.loginForm.email,
        password: this.loginForm.password
      });
      if (error) this.loginError = error.message;
      else this.user = data.user;
    },
    async handleLogout() {
      await supabase.auth.signOut();
      this.user = null;
    },
    async fetchEmployees() {
      const { data, error } = await supabase.from('tbemployee').select('*').is('deletedatetime', null);
      if (error) console.error('Error fetching employees:', error);
      else this.employees = data;
    },
    openEmployeeForm() {
      this.isEditing = false;
      this.employeeForm = { id: null, employeename: '', age: '', phone: '' };
      this.showEmployeeForm = true;
    },
    async saveEmployee() {
      const now = new Date().toISOString();
      if (this.isEditing) {
        await supabase.from('tbemployee').update({
          employeename: this.employeeForm.employeename,
          age: this.employeeForm.age,
          phone: this.employeeForm.phone,
          updatedatetime: now
        }).eq('id', this.employeeForm.id);
      } else {
        await supabase.from('tbemployee').insert([{ 
          employeename: this.employeeForm.employeename,
          age: this.employeeForm.age,
          phone: this.employeeForm.phone,
          createdatetime: now,
          updatedatetime: now
        }]);
      }
      await this.fetchEmployees();
      this.showEmployeeForm = false;
    }
  }
};
</script>

<style scoped>
.container-fluid {
  padding: 20px;
}
.table {
  border-radius: 8px;
}
.btn {
  text-transform: none;
  font-weight: 500;
}
</style>
