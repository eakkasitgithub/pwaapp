<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- If not logged in, show login -->
        <div v-if="!user">
          <v-row class="fill-height" align="center" justify="center">
            <v-col cols="12" sm="8" md="6" lg="4">
              <v-card class="pa-4 sleek-card elevation-4">
                <v-card-title class="headline text-center">Login</v-card-title>
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
                  <v-alert v-if="loginError" type="error" class="mt-4">
                    {{ loginError }}
                  </v-alert>
                </v-card-text>
              </v-card>
            </v-col>
          </v-row>
        </div>

        <!-- If logged in, show Employee Management -->
        <div v-else>
          <v-row class="mb-4">
            <v-col cols="12" class="text-end">
              <v-btn color="primary" @click="handleLogout" outlined>
                Logout
              </v-btn>
            </v-col>
          </v-row>

          <!-- Header -->
          <v-card class="mb-5 elevation-2">
            <v-card-title class="text-h6 font-weight-bold">Manage Employees</v-card-title>
          </v-card>

          <!-- Create New Employee Button -->
          <v-row class="mb-4">
            <v-col cols="12">
              <v-btn color="primary" class="text-capitalize" elevation="2" @click="createEmployee">
                + Create New Employee
              </v-btn>
            </v-col>
          </v-row>

          <!-- Employee Table -->
          <v-card elevation="2">
            <v-card-text>
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
                  <v-btn color="blue" variant="tonal" small class="mr-2" @click="editEmployee(item)">
                    Edit
                  </v-btn>
                  <v-btn color="red" variant="tonal" small @click="deleteEmployee(item.id)">
                    Delete
                  </v-btn>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { createClient } from '@supabase/supabase-js'

// 🔹 Supabase Configuration
const supabaseUrl = 'https://yrtaklxwrlbatvigvlnl.supabase.co'
const supabaseKey = 'your-supabase-key' // Replace with your actual Supabase Key
const supabase = createClient(supabaseUrl, supabaseKey)

export default {
  name: 'App',
  data() {
    return {
      user: null,
      loginForm: {
        email: '',
        password: ''
      },
      loginError: null,
      employees: [],
      employeeForm: {
        id: null,
        employeename: '',
        age: null,
        phone: ''
      },
      editing: false,
      searchQuery: '',
      tableHeaders: [
        { text: 'ID', value: 'id', sortable: true },
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
      await this.fetchEmployees()
    }
    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session ? session.user : null
      if (this.user) this.fetchEmployees()
      else this.employees = []
    })
  },
  methods: {
    // 🔹 Login
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
    // 🔹 Logout
    async handleLogout() {
      await supabase.auth.signOut()
      this.user = null
    },
    // 🔹 Fetch Employees
    async fetchEmployees() {
      const { data, error } = await supabase.from('tbemployee').select('*').is('deletedatetime', null)
      if (error) console.error('Error fetching employees:', error)
      else this.employees = data
    },
    // 🔹 Create Employee
    createEmployee() {
      console.log('Create Employee Clicked')
    },
    // 🔹 Edit Employee
    editEmployee(employee) {
      console.log('Edit Employee:', employee)
    },
    // 🔹 Delete Employee (Soft Delete)
    async deleteEmployee(id) {
      await supabase.from('tbemployee').update({ deletedatetime: new Date().toISOString() }).eq('id', id)
      await this.fetchEmployees()
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : ''
    }
  }
}
</script>

<style scoped>
.v-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-bottom: 40px;
}

.sleek-card {
  border-radius: 8px;
}

.headline {
  font-weight: bold;
  font-size: 1.5rem;
}

.v-btn {
  text-transform: none;
  font-weight: 500;
}

.v-data-table {
  border-radius: 8px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
