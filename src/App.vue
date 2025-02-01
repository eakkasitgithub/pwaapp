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

          <!-- Employee Form Modal -->
          <div v-if="showEmployeeForm" class="modal-overlay">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ isEditing ? 'Edit Employee' : 'Create New Employee' }}</h5>
                <button type="button" class="btn-close" @click="closeEmployeeForm"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="saveEmployee">
                  <div class="mb-3">
                    <label class="form-label">Employee Name</label>
                    <input v-model="employeeForm.employeename" type="text" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Age</label>
                    <input v-model="employeeForm.age" type="number" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label">Phone</label>
                    <input v-model="employeeForm.phone" type="text" class="form-control" required>
                  </div>
                  <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeEmployeeForm">Cancel</button>
                    <button type="submit" class="btn btn-primary">{{ isEditing ? 'Update' : 'Create' }}</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
methods: {
  openEmployeeForm() {
    this.isEditing = false; // Ensure it's in create mode
    this.employeeForm = { id: null, employeename: '', age: '', phone: '' };
    this.showEmployeeForm = true;
  },
  async saveEmployee() {
    try {
      const now = new Date().toISOString();

      if (this.isEditing) {
        const { data, error } = await supabase
          .from('tbemployee')
          .update({
            employeename: this.employeeForm.employeename,
            age: this.employeeForm.age,
            phone: this.employeeForm.phone,
            updatedatetime: now
          })
          .eq('id', this.employeeForm.id);

        if (error) throw error;
        console.log('Employee updated successfully:', data);
      } else {
        this.isEditing = false; // Ensure it's in create mode
        const { data, error } = await supabase
          .from('tbemployee')
          .insert([{
            employeename: this.employeeForm.employeename,
            age: this.employeeForm.age,
            phone: this.employeeForm.phone,
            createdatetime: now,
            updatedatetime: now
          }]);

        if (error) throw error;
        console.log('Employee created successfully:', data);
      }

      await this.fetchEmployees();
      this.closeEmployeeForm();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Failed to save employee. Check the console for details.');
    }
  }
}
</script>
