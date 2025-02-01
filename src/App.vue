<template>
  <v-app>
    <v-main>
      <v-container class="container-fluid">
        <div v-if="!user" class="row justify-content-center mt-5">
          <div class="col-md-4">
            <div class="card shadow-lg border-0 rounded-lg">
              <div class="card-header bg-primary text-white text-center py-3">
                <h4>Admin Login</h4>
              </div>
              <div class="card-body p-4">
                <form @submit.prevent="handleLogin">
                  <div class="mb-3">
                    <label class="form-label fw-bold">Email</label>
                    <input v-model="loginForm.email" type="email" class="form-control" required>
                  </div>
                  <div class="mb-3">
                    <label class="form-label fw-bold">Password</label>
                    <input v-model="loginForm.password" type="password" class="form-control" required>
                  </div>
                  <button type="submit" class="btn btn-primary w-100 fw-bold">Login</button>
                </form>
                <div v-if="loginError" class="alert alert-danger mt-3">{{ loginError }}</div>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <nav class="navbar navbar-expand-lg navbar-dark bg-dark mb-4 p-3">
            <div class="container-fluid">
              <a class="navbar-brand fw-bold" href="#">Enterprise Employee Management</a>
              <button class="btn btn-outline-light fw-bold" @click="handleLogout">Logout</button>
            </div>
          </nav>

          <div class="card shadow-lg border-0 rounded-lg">
            <div class="card-header bg-primary text-white p-3">
              <h4 class="mb-0 fw-bold">Manage Employees</h4>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <button class="btn btn-success fw-bold" @click="createEmployee">+ Add New Employee</button>
                <input v-model="searchQuery" class="form-control w-25" placeholder="Search Employees">
              </div>

              <table class="table table-bordered table-hover text-center">
                <thead class="table-dark">
                  <tr>
                    <th class="fw-bold" style="width: 5%;" @click="sort('id')">ID</th>
                    <th class="fw-bold" style="width: 20%;" @click="sort('employeename')">Employee Name</th>
                    <th class="fw-bold" style="width: 10%;" @click="sort('age')">Age</th>
                    <th class="fw-bold" style="width: 15%;" @click="sort('phone')">Phone</th>
                    <th class="fw-bold" style="width: 20%;" @click="sort('createdatetime')">Created</th>
                    <th class="fw-bold" style="width: 20%;" @click="sort('updatedatetime')">Updated</th>
                    <th class="fw-bold" style="width: 10%;">Actions</th>
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
                      <button class="btn btn-sm btn-primary me-2 fw-bold" @click="editEmployee(employee)">Edit</button>
                      <button class="btn btn-sm btn-danger fw-bold" @click="deleteEmployee(employee.id)">Delete</button>
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

<style scoped>
.container-fluid {
  padding: 20px;
}
.card {
  border-radius: 12px;
}
.navbar-brand {
  font-weight: bold;
  font-size: 1.3rem;
}
.table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
}
.btn {
  text-transform: none;
  font-weight: 600;
}
th {
  cursor: pointer;
}
th:hover {
  background: #212529 !important;
  color: #f8f9fa !important;
}
</style>
