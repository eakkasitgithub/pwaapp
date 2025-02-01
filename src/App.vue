<template>
  <v-app>
    <v-main>
      <v-container class="my-container">
        <!-- If user is not logged in, show the login form -->
        <div v-if="!user">
          <v-row class="fill-height" align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4">
              <v-card class="pa-4 sleek-card" elevation="4">
                <v-card-title class="justify-center headline">Login</v-card-title>
                <v-card-text>
                  <v-form @submit.prevent="handleLogin">
                    <v-text-field
                      v-model="loginForm.email"
                      label="Email"
                      type="email"
                      required
                      outlined
                      dense
                    />
                    <v-text-field
                      v-model="loginForm.password"
                      label="Password"
                      type="password"
                      required
                      outlined
                      dense
                    />
                    <v-btn color="primary" type="submit" class="mt-4" block>
                      Login
                    </v-btn>
                  </v-form>
                  <v-alert
                    v-if="loginError"
                    type="error"
                    class="mt-4"
                    border="start"
                    colored-border
                  >
                    {{ loginError }}
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- Once logged in, show Employee Management UI -->
        <div v-else>
          <v-row class="mb-4">
            <v-col cols="12" class="text-end">
              <v-btn color="primary" @click="handleLogout" outlined>
                Logout
              </v-btn>
            </v-col>
          </v-row>

          <v-card class="pa-4 sleek-card mb-4" elevation="4">
            <v-card-title class="headline">Employee Management</v-card-title>
            <v-card-text>
              <v-form @submit.prevent="handleSubmit">
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="employeeForm.employeename"
                      label="Employee Name"
                      required
                      outlined
                      dense
                    />
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model.number="employeeForm.age"
                      label="Age"
                      type="number"
                      required
                      outlined
                      dense
                    />
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-text-field
                      v-model="employeeForm.phone"
                      label="Phone"
                      required
                      outlined
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12" class="text-end">
                    <v-btn color="success" type="submit" class="mr-2">
                      {{ editing ? 'Update' : 'Create' }}
                    </v-btn>
                    <v-btn
                      color="grey"
                      type="button"
                      v-if="editing"
                      @click="cancelEdit"
                    >
                      Cancel
                    </v-btn>
                  </v-col>
                </v-row>
              </v-form>
            </v-card-text>
          </v-card>

          <v-card class="pa-4 sleek-card" elevation="4">
            <v-card-title class="headline">Employee List</v-card-title>
            <!-- Search Box -->
            <v-text-field
              v-model="searchQuery"
              label="Search"
              append-inner-icon="mdi-magnify"
              outlined
              dense
              class="mb-4"
            />
            <v-data-table
              :headers="tableHeaders"
              :items="employees"
              :search="searchQuery"
              :items-per-page="5"
              class="elevation-1"
            >
              <template #item.createdatetime="{ item }">
                {{ formatDate(item.createdatetime) }}
              </template>
              <template #item.updatedatetime="{ item }">
                {{ formatDate(item.updatedatetime) }}
              </template>
              <template #item.actions="{ item }">
                <v-btn icon @click="editEmployee(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn icon @click="deleteEmployee(item.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-card>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { createClient } from '@supabase/supabase-js'

// Supabase initialization using your provided credentials
const supabaseUrl = 'https://yrtaklxwrlbatvigvlnl.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlydGFrbHh3cmxiYXR2aWd2bG5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc1Mjc5MDIsImV4cCI6MjA1MzEwMzkwMn0.8L1UX5CqFYjkr-yznH_nm57fvTcIKAzLbm1-qPnsTfk'
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
        employeename: '',
        age: null,
        phone: ''
      },
      editing: false,
      // Search query for filtering table data
      searchQuery: '',
      // Table headers for the data table with sorting enabled
      tableHeaders: [
        { text: 'Employee Name', value: 'employeename', sortable: true },
        { text: 'Age', value: 'age', sortable: true },
        { text: 'Phone', value: 'phone', sortable: true },
        { text: 'Created', value: 'createdatetime', sortable: true },
        { text: 'Updated', value: 'updatedatetime', sortable: true },
        { text: 'Actions', value: 'actions', sortable: false }
      ]
    }
  },
  async created() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      this.user = session.user
      this.fetchEmployees()
    }
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
    async handleLogout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Error logging out:', error)
        }
        this.user = null
      } catch (err) {
        console.error('Logout error:', err)
      }
    },
    async fetchEmployees() {
      try {
        const { data, error } = await supabase
          .from('tbemployee')
          .select('*')
          .is('deletedatetime', null)
        if (error) {
          console.error('Error fetching employees:', error)
        } else {
          console.log('Fetched employees:', data)
          this.employees = data
        }
      } catch (err) {
        console.error('Fetch employees error:', err)
      }
    },
    async handleSubmit() {
      if (this.editing) {
        await this.updateEmployee()
      } else {
        await this.createEmployee()
      }
      this.resetForm()
      await this.fetchEmployees()
    },
    async createEmployee() {
      const now = new Date().toISOString()
      try {
        console.log('Inserting employee:', {
          employeename: this.employeeForm.employeename,
          age: this.employeeForm.age,
          phone: this.employeeForm.phone,
          createdatetime: now,
          updatedatetime: now,
          deletedatetime: null
        })
        const { data, error } = await supabase
          .from('tbemployee')
          .insert([{
            employeename: this.employeeForm.employeename,
            age: this.employeeForm.age,
            phone: this.employeeForm.phone,
            createdatetime: now,
            updatedatetime: now,
            deletedatetime: null
          }])
        if (error) {
          console.error('Error creating employee:', error)
        } else {
          console.log('Employee created:', data)
        }
      } catch (err) {
        console.error('Create employee error:', err)
      }
    },
    editEmployee(employee) {
      this.employeeForm = { ...employee }
      this.editing = true
    },
    cancelEdit() {
      this.resetForm()
    },
    resetForm() {
      this.employeeForm = {
        id: null,
        employeename: '',
        age: null,
        phone: ''
      }
      this.editing = false
    },
    async updateEmployee() {
      const now = new Date().toISOString()
      try {
        const { error } = await supabase
          .from('tbemployee')
          .update({
            employeename: this.employeeForm.employeename,
            age: this.employeeForm.age,
            phone: this.employeeForm.phone,
            updatedatetime: now
          })
          .eq('id', this.employeeForm.id)
        if (error) {
          console.error('Error updating employee:', error)
        }
      } catch (err) {
        console.error('Update employee error:', err)
      }
    },
    async deleteEmployee(id) {
      const now = new Date().toISOString()
      try {
        const { error } = await supabase
          .from('tbemployee')
          .update({ deletedatetime: now })
          .eq('id', id)
        if (error) {
          console.error('Error deleting employee:', error)
        }
        await this.fetchEmployees()
      } catch (err) {
        console.error('Delete employee error:', err)
      }
    },
    formatDate(dateString) {
      if (!dateString) return ''
      return new Date(dateString).toLocaleString()
    }
  }
}
</script>

<style scoped>
.my-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.sleek-card {
  margin-bottom: 24px;
  border-radius: 8px;
}

.headline {
  font-weight: bold;
  font-size: 1.5rem;
}

/* Adjust data table font size for better readability */
.v-data-table {
  font-size: 0.9rem;
}

/* Override default Vuetify button text-transform */
.v-btn {
  text-transform: none;
}
</style>
