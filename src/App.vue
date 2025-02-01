<template>
  <div id="app">
    <!-- If user is not logged in, show the login form -->
    <div v-if="!user">
      <h2>Login</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <label for="email">Email:</label>
          <input id="email" type="email" v-model="loginForm.email" required />
        </div>
        <div>
          <label for="password">Password:</label>
          <input id="password" type="password" v-model="loginForm.password" required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p v-if="loginError" style="color: red;">{{ loginError }}</p>
    </div>

    <!-- Once logged in, show Employee Management UI -->
    <div v-else>
      <button @click="handleLogout">Logout</button>
      <h1>Employee Management</h1>
      
      <!-- Employee Form -->
      <form @submit.prevent="handleSubmit">
        <div>
          <label for="name">Employee Name:</label>
          <input id="name" type="text" v-model="employeeForm.EmployeeName" required />
        </div>
        <div>
          <label for="age">Age:</label>
          <input id="age" type="number" v-model.number="employeeForm.Age" required />
        </div>
        <div>
          <label for="phone">Phone:</label>
          <input id="phone" type="text" v-model="employeeForm.Phone" required />
        </div>
        <button type="submit">{{ editing ? 'Update' : 'Create' }}</button>
        <button type="button" v-if="editing" @click="cancelEdit">Cancel</button>
      </form>
      
      <!-- Employee Table -->
      <table>
        <thead>
          <tr>
            <th>Employee Name</th>
            <th>Age</th>
            <th>Phone</th>
            <th>Create Date</th>
            <th>Update Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="employee in employees" :key="employee.id">
            <td>{{ employee.EmployeeName }}</td>
            <td>{{ employee.Age }}</td>
            <td>{{ employee.Phone }}</td>
            <td>{{ formatDate(employee.CreateDateTime) }}</td>
            <td>{{ formatDate(employee.UpdateDateTime) }}</td>
            <td>
              <button @click="editEmployee(employee)">Edit</button>
              <button @click="deleteEmployee(employee.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { createClient } from '@supabase/supabase-js'

// Supabase initialization using your provided credentials
const supabaseUrl = 'https://yrtaklxwrlbatvigvlnl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydGFrbHh3cmxiYXR2aWd2bG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Mjc5MDIsImV4cCI6MjA1MzEwMzkwMn0.8L1UX5CqFYjkr-yznH_nm57fvTcIKAzLbm1-qPnsTfk'
const supabase = createClient(supabaseUrl, supabaseKey)

export default {
  name: 'App',
  data() {
    return {
      // Authentication-related data
      user: null,
      loginForm: {
        email: '',
        password: ''
      },
      loginError: null,
      // Employee management data
      employees: [],
      employeeForm: {
        id: null,
        EmployeeName: '',
        Age: null,
        Phone: ''
      },
      editing: false
    }
  },
  async created() {
    // Get the current session using Supabase v2 API
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      this.user = session.user
      this.fetchEmployees()
    }
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session ? session.user : null
      if (this.user) {
        this.fetchEmployees()
      } else {
        this.employees = []
      }
    })
  },
  methods: {
    // Login using Supabase Auth
    async handleLogin() {
      this.loginError = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: this.loginForm.email,
          password: this.loginForm.password
        })
        if (error) {
          this.loginError = error.message
        } else {
          this.user = data.user
          this.fetchEmployees()
        }
      } catch (err) {
        console.error('Login error:', err)
        this.loginError = 'Login failed. Please try again.'
      }
    },
    // Logout
    async handleLogout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error("Error logging out:", error)
        }
        this.user = null
      } catch (err) {
        console.error('Logout error:', err)
      }
    },
    // Fetch employee records where DeleteDateTime is null
    async fetchEmployees() {
      try {
        const { data, error } = await supabase
          .from('tbEmployee')
          .select('*')
          //.is('DeleteDateTime', null)
        if (error) {
          console.error('Error fetching employees:', error)
        } else {
          this.employees = data
        }
      } catch (err) {
        console.error('Fetch employees error:', err)
      }
    },
    // Handle form submission for create/update
    async handleSubmit() {
      if (this.editing) {
        await this.updateEmployee()
      } else {
        await this.createEmployee()
      }
      this.resetForm()
      await this.fetchEmployees()
    },
    // Create a new employee record
    async createEmployee() {
      const now = new Date().toISOString()
      try {
        const { error } = await supabase
          .from('tbEmployee')
          .insert([{
            EmployeeName: this.employeeForm.EmployeeName,
            Age: this.employeeForm.Age,
            Phone: this.employeeForm.Phone,
            CreateDateTime: now,
            UpdateDateTime: now,
            DeleteDateTime: null
          }])
        if (error) {
          console.error('Error creating employee:', error)
        }
      } catch (err) {
        console.error('Create employee error:', err)
      }
    },
    // Prepare the form for editing an existing employee
    editEmployee(employee) {
      this.employeeForm = { ...employee }
      this.editing = true
    },
    // Cancel editing and reset the form
    cancelEdit() {
      this.resetForm()
    },
    // Reset form values and editing state
    resetForm() {
      this.employeeForm = {
        id: null,
        EmployeeName: '',
        Age: null,
        Phone: ''
      }
      this.editing = false
    },
    // Update an existing employee record
    async updateEmployee() {
      const now = new Date().toISOString()
      try {
        const { error } = await supabase
          .from('tbEmployee')
          .update({
            EmployeeName: this.employeeForm.EmployeeName,
            Age: this.employeeForm.Age,
            Phone: this.employeeForm.Phone,
            UpdateDateTime: now
          })
          .eq('id', this.employeeForm.id)
        if (error) {
          console.error('Error updating employee:', error)
        }
      } catch (err) {
        console.error('Update employee error:', err)
      }
    },
    // Soft-delete an employee record by setting DeleteDateTime
    async deleteEmployee(id) {
      const now = new Date().toISOString()
      try {
        const { error } = await supabase
          .from('tbEmployee')
          .update({ DeleteDateTime: now })
          .eq('id', id)
        if (error) {
          console.error('Error deleting employee:', error)
        }
        await this.fetchEmployees()
      } catch (err) {
        console.error('Delete employee error:', err)
      }
    },
    // Utility to format timestamps
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString()
    }
  }
}
</script>

<style scoped>
/* Basic styling for the form and table */
table {
  border-collapse: collapse;
  width: 100%;
  margin-top: 20px;
}
th, td {
  border: 1px solid #ddd;
  padding: 8px;
}
form > div {
  margin-bottom: 10px;
}
</style>
