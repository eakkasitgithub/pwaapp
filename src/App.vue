<template>
  <v-app>
    <v-main>
      <v-container>
        <!-- Manage Posts Section -->
        <v-card class="mb-5 elevation-2">
          <v-card-title class="text-h6 font-weight-bold">
            Manage Employees
          </v-card-title>
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
            <v-data-table
              :headers="tableHeaders"
              :items="employees"
              :items-per-page="5"
              class="elevation-1"
              dense
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
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yrtaklxwrlbatvigvlnl.supabase.co'
const supabaseKey = 'your-supabase-key'
const supabase = createClient(supabaseUrl, supabaseKey)

export default {
  name: 'App',
  data() {
    return {
      employees: [],
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
    await this.fetchEmployees()
  },
  methods: {
    async fetchEmployees() {
      const { data, error } = await supabase.from('tbemployee').select('*').is('deletedatetime', null)
      if (error) console.error('Error fetching employees:', error)
      else this.employees = data
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString() : ''
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
    }
  }
}
</script>

<style scoped>
.v-data-table {
  border-radius: 8px;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.1);
}

.v-btn {
  text-transform: none;
  font-weight: 500;
}

.v-card {
  border-radius: 8px;
}
</style>
