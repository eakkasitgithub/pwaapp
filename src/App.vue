<template>
  <!-- This is the main structure of the app -->
  <v-app>
    <v-main>
      <v-container class="container-fluid">
        <!-- If the user is not logged in, show the login form -->
        <div v-if="!user" class="row justify-content-center mt-5">
          <div class="col-md-6">
            <div class="card shadow">
              <!-- Login form header -->
              <div class="card-header bg-primary text-white text-center">Login</div>
              <div class="card-body">
                <!-- Form for logging in -->
                <form @submit.prevent="handleLogin">
                  <!-- Email input field -->
                  <div class="mb-3">
                    <label class="form-label">Email</label>
                    <input v-model="loginForm.email" type="email" class="form-control" required>
                  </div>
                  <!-- Password input field -->
                  <div class="mb-3">
                    <label class="form-label">Password</label>
                    <input v-model="loginForm.password" type="password" class="form-control" required>
                  </div>
                  <!-- Submit button for the form -->
                  <button type="submit" class="btn btn-primary w-100">Login</button>
                </form>
                <!-- Show error message if login fails -->
                <div v-if="loginError" class="alert alert-danger mt-3">{{ loginError }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- If the user is logged in, show the dashboard -->
        <div v-else>
          <!-- Navigation bar at the top -->
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
            <div class="container-fluid">
              <a class="navbar-brand" href="#">Admin Dashboard</a>
              <!-- Logout button -->
              <button class="btn btn-outline-light" @click="handleLogout">Logout</button>
            </div>
          </nav>

          <!-- Card for managing employees -->
          <div class="card shadow mb-4">
            <div class="card-header bg-primary text-white">Manage Employees</div>
            <div class="card-body">
              <!-- Button to create a new employee -->
              <button class="btn btn-success mb-3" @click="createEmployee">+ Create New Employee</button>
              <!-- Search bar to filter employees -->
              <input v-model="searchQuery" class="form-control mb-3" placeholder="Search Employees">

              <!-- Table to display employees -->
              <table class="table table-striped table-hover">
                <thead class="table-dark">
                  <!-- Table headers with sorting functionality -->
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
                  <!-- Loop through each employee and display their information -->
                  <tr v-for="employee in filteredEmployees" :key="employee.id">
                    <td>{{ employee.id }}</td>
                    <td>{{ employee.employeename }}</td>
                    <td>{{ employee.age }}</td>
                    <td>{{ employee.phone }}</td>
                    <td>{{ formatDate(employee.createdatetime) }}</td>
                    <td>{{ formatDate(employee.updatedatetime) }}</td>
                    <td>
                      <!-- Buttons to edit or delete an employee -->
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
// Import the Supabase client to connect to the database
import { createClient } from '@supabase/supabase-js'

// Set up the connection to the Supabase database
const supabaseUrl = 'https://yrtaklxwrlbatvigvlnl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydGFrbHh3cmxiYXR2aWd2bG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Mjc5MDIsImV4cCI6MjA1MzEwMzkwMn0.8L1UX5CqFYjkr-yznH_nm57fvTcIKAzLbm1-qPnsTfk'
const supabase = createClient(supabaseUrl, supabaseKey)

export default {
  name: 'App',
  data() {
    return {
      user: null, // Stores the logged-in user
      loginForm: { email: '', password: '' }, // Stores the login form data
      loginError: null, // Stores any login error messages
      employees: [], // Stores the list of employees
      searchQuery: '', // Stores the search query for filtering employees
      sortKey: 'id', // Stores the current column to sort by
      sortOrder: 'asc' // Stores the current sort order (ascending or descending)
    }
  },
  async created() {
    // Check if the user is already logged in when the app starts
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      this.user = session.user
      await this.fetchEmployees() // Fetch the list of employees
    }
    // Listen for changes in the user's login status
    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session ? session.user : null
      if (this.user) this.fetchEmployees() // Fetch employees if the user is logged in
      else this.employees = [] // Clear the employee list if the user logs out
    })
  },
  computed: {
    // Filter and sort the list of employees based on the search query and sort settings
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
    // Handle the login process
    async handleLogin() {
      this.loginError = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.loginForm.email,
          password: this.loginForm.password
        })
        if (error) this.loginError = error.message // Show error if login fails
        else this.user = data.user // Set the user if login is successful
      } catch (err) {
        this.loginError = 'Login failed. Try again.' // Show a generic error message
      }
    },
    // Handle the logout process
    async handleLogout() {
      await supabase.auth.signOut()
      this.user = null // Clear the user when logged out
    },
    // Fetch the list of employees from the database
    async fetchEmployees() {
      const { data, error } = await supabase.from('tbemployee').select('*').is('deletedatetime', null)
      if (error) console.error('Error fetching employees:', error)
      else this.employees = data // Update the employee list
    },
    // Handle creating a new employee (currently just logs a message)
    createEmployee() {
      console.log('Create Employee Clicked')
    },
    // Handle editing an employee (currently just logs the employee data)
    editEmployee(employee) {
      console.log('Edit Employee:', employee)
    },
    // Handle deleting an employee by marking them as deleted in the database
    async deleteEmployee(id) {
      await supabase.from('tbemployee').update({ deletedatetime: new Date().toISOString() }).eq('id', id)
      await this.fetchEmployees() // Refresh the employee list
    },
    // Format a date to make it easier to read
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : ''
    },
    // Sort the employee list by a specific column
    sort(key) {
      this.sortOrder = this.sortKey === key && this.sortOrder === 'asc' ? 'desc' : 'asc';
      this.sortKey = key;
    }
  }
}
</script>

<style scoped>
/* Basic styling for the app */
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