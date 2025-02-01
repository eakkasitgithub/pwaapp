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
              <button class="btn btn-success mb-3" @click="createEmployee">+ Create New Employee</button>
              <input v-model="searchQuery" class="form-control mb-3" placeholder="Search Employees">

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
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yrtaklxwrlbatvigvlnl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydGFrbHh3cmxiYXR2aWd2bG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Mjc5MDIsImV4cCI6MjA1MzEwMzkwMn0.8L1UX5CqFYjkr-yznH_nm57fvTcIKAzLbm1-qPnsTfk'
const supabase = createClient(supabaseUrl, supabaseKey)

export default {
  name: 'App',
  data() {
    return {
      user: null,
      loginForm: { email: '', password: '' },
      loginError: null,
      employees: [],
      searchQuery: '',
      sortKey: 'id',
      sortOrder: 'asc'
    }
  },
  async created() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      this.user = session.user
      await this.fetchEmployees()
    }
    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session ? session.user : null
      if (this.user) this.fetchEmployees()
      else this.employees = []
    })
  },
  computed: {
    filteredEmployees() {
      return this.employees.filter(emp =>
        Object.values(emp).some(value =>
          String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
        )
      ).sort((a, b) => {
        let modifier = this.sortOrder === 'asc' ? 1 : -1;
        return a[this.sortKey] > b[this.sortKey] ? modifier : -modifier;
      });
    }
  },
  methods: {
    async handleLogin() {
      this.loginError = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.loginForm.email,
          password: this.loginForm.password
        })
        if (error) this.loginError = error.message
        else this.user = data.user
      } catch (err) {
        this.loginError = 'Login failed. Try again.'
      }
    },
    async handleLogout() {
      await supabase.auth.signOut()
      this.user = null
    },
    async fetchEmployees() {
      const { data, error } = await supabase.from('tbemployee').select('*').is('deletedatetime', null)
      if (error) console.error('Error fetching employees:', error)
      else this.employees = data
    },
    createEmployee() {
      console.log('Create Employee Clicked')
    },
    editEmployee(employee) {
      console.log('Edit Employee:', employee)
    },
    async deleteEmployee(id) {
      await supabase.from('tbemployee').update({ deletedatetime: new Date().toISOString() }).eq('id', id)
      await this.fetchEmployees()
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : ''
    },
    sort(key) {
      this.sortOrder = this.sortKey === key && this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.sortKey = key;
    }
  }
}
</script>

<style scoped>
.container-fluid {
  padding: 20px;
}
.card {
  border-radius: 8px;
}
.navbar-brand {
  font-weight: bold;
}
.table {
  border-radius: 8px;
  overflow: hidden;
}
.btn {
  text-transform: none;
  font-weight: 500;
}
</style>
