<template>
  <div id="app">
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
</template>

<script>
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Client – Replace with your actual Supabase URL and anon key.
const supabaseUrl = 'https://yrtaklxwrlbatvigvlnl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydGFrbHh3cmxiYXR2aWd2bG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Mjc5MDIsImV4cCI6MjA1MzEwMzkwMn0.8L1UX5CqFYjkr-yznH_nm57fvTcIKAzLbm1-qPnsTfk'

const supabase = createClient(supabaseUrl, supabaseKey)

export default {
  name: 'App',
  data() {
    return {
      // List of employee records
      employees: [],
      // Form for creating/updating an employee
      employeeForm: {
        id: null,
        EmployeeName: '',
        Age: null,
        Phone: ''
      },
      // Flag to determine if we are editing an existing record
      editing: false
    }
  },
  created() {
    this.fetchEmployees()
  },
  methods: {
    // Fetch records where DeleteDateTime is null
    async fetchEmployees() {
      const { data, error } = await supabase
        .from('tbEmployee')
        .select('*')
        .is('DeleteDateTime', null)
      if (error) {
        console.error('Error fetching employees:', error)
      } else {
        this.employees = data
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
    },
    // "Delete" an employee record by setting DeleteDateTime
    async deleteEmployee(id) {
      const now = new Date().toISOString()
      const { error } = await supabase
        .from('tbEmployee')
        .update({ DeleteDateTime: now })
        .eq('id', id)
      if (error) {
        console.error('Error deleting employee:', error)
      }
      await this.fetchEmployees()
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
/* Basic styling for the table and form */
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
