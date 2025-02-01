<template>
  <v-app>
    <v-main>
      <v-container class="container-fluid">
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

        <div v-else>
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div class="container-fluid">
              <a class="navbar-brand" href="#">Admin Dashboard</a>
              <button class="btn btn-outline-light" @click="handleLogout">Logout</button>
            </div>
          </nav>

          <div class="card shadow mb-4">
            <div class="card-header bg-primary text-white">Manage Employees</div>
            <div class="card-body">
              <button class="btn btn-success mb-3" @click="showCreateModal = true">+ Create New Employee</button>
              <input v-model="searchQuery" class="form-control mb-3" placeholder="Search Employees">

              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <tr>
                    <th class="sortable" @click="sort('id')">ID <span v-if="sortKey === 'id'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
                    <th class="sortable" @click="sort('employeename')">Employee Name <span v-if="sortKey === 'employeename'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
                    <th class="sortable" @click="sort('age')">Age <span v-if="sortKey === 'age'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
                    <th class="sortable" @click="sort('phone')">Phone <span v-if="sortKey === 'phone'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
                    <th class="sortable" @click="sort('createdatetime')">Created <span v-if="sortKey === 'createdatetime'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
                    <th class="sortable" @click="sort('updatedatetime')">Updated <span v-if="sortKey === 'updatedatetime'">{{ sortOrder === 'asc' ? '▲' : '▼' }}</span></th>
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

      <!-- Create Employee Modal -->
      <v-dialog v-model="showCreateModal" persistent max-width="400px">
        <v-card>
          <v-card-title class="bg-primary text-white">Create New Employee</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="createEmployee">
              <v-text-field v-model="newEmployee.employeename" label="Employee Name" required></v-text-field>
              <v-text-field v-model="newEmployee.age" label="Age" type="number" required></v-text-field>
              <v-text-field v-model="newEmployee.phone" label="Phone" required></v-text-field>
              <v-btn color="primary" type="submit">Create</v-btn>
              <v-btn @click="showCreateModal = false" class="ml-2">Cancel</v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-dialog>
    </v-main>
  </v-app>
</template>

<script>
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yrtaklxwrlbatvigvlnl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydGFrbHh3cmxiYXR2aWd2bG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Mjc5MDIsImV4cCI6MjA1MzEwMzkwMn0.8L1UX5CqFYjkr-yznH_nm57fvTcIKAzLbm1-qPnsTfk'
const supabase = createClient(supabaseUrl, supabaseKey)

export default {
  data() {
    return {
      user: null,
      sortKey: 'id',
      sortOrder: 'asc',
      showCreateModal: false,
      newEmployee: { employeename: '', age: '', phone: '' }
    }
  },
  methods: {
    async createEmployee() {
      if (!this.newEmployee.employeename || !this.newEmployee.age || !this.newEmployee.phone) return;
      const now = new Date().toISOString();
      await supabase.from('tbemployee').insert({
        employeename: this.newEmployee.employeename,
        age: this.newEmployee.age,
        phone: this.newEmployee.phone,
        createdatetime: now,
        updatedatetime: now
      });
      this.showCreateModal = false;
      this.newEmployee = { employeename: '', age: '', phone: '' };
      this.fetchEmployees();
    },
    sort(key) {
      this.sortOrder = this.sortKey === key && this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.sortKey = key;
    }
  }
}
</script>

<style scoped>
th.sortable {
  cursor: pointer;
}
th.sortable:hover {
  background-color: #343a40 !important;
  color: #ffffff !important;
}
</style>
