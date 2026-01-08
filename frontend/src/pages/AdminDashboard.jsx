import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import EmployeeForm from '../components/EmployeeForm';
import AttendanceTable from '../components/AttendanceTable';

function AdminDashboard() {
  const { logout } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [message, setMessage] = useState('');
  const [day, setDay] = useState('');
  const [dayList, setDayList] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyEmployeeId, setHistoryEmployeeId] = useState('');
  const [historyMonth, setHistoryMonth] = useState('');
  const [historyTotal, setHistoryTotal] = useState(0);
  const activeCount = employees.filter((employee) => employee.isActive).length;
  const adminCount = employees.filter((employee) => employee.role === 'ADMIN').length;

  const loadEmployees = async () => {
    const response = await api.get('/employees');
    setEmployees(response.data);
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const handleCreateOrUpdate = async (form) => {
    setMessage('');
    try {
      if (selectedEmployee) {
        const response = await api.put(`/employees/${selectedEmployee.id}`, {
          ...form,
          salary: form.salary || 0,
          joinDate: form.joinDate || undefined,
          password: form.password || undefined
        });
        setMessage(`Updated ${response.data.name}`);
      } else {
        const response = await api.post('/employees', {
          ...form,
          salary: form.salary || 0,
          joinDate: form.joinDate || undefined
        });
        setMessage(`Added ${response.data.name}`);
      }
      setSelectedEmployee(null);
      await loadEmployees();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeactivate = async (employee) => {
    await api.put(`/employees/${employee.id}`, { isActive: false });
    await loadEmployees();
  };

  const handleDelete = async (employee) => {
    const ok = window.confirm(`Delete ${employee.name}? This cannot be undone.`);
    if (!ok) return;
    await api.delete(`/employees/${employee.id}`);
    await loadEmployees();
  };

  const handleDaySearch = async () => {
    if (!day) return;
    const response = await api.get(`/attendance/day?date=${day}`);
    setDayList(response.data.list || []);
  };

  const handleHistorySearch = async () => {
    if (!historyEmployeeId) return;
    const query = historyMonth ? `?month=${historyMonth}` : '';
    const response = await api.get(`/attendance/employee/${historyEmployeeId}${query}`);
    setHistory(response.data.attendance || []);
    setHistoryTotal(response.data.totalHours || 0);
  };

  return (
    <div className="app-shell">
      <div className="page">
        <header className="page-header">
          <div>
            <h2>Admin Dashboard</h2>
            <p className="muted">Manage employees, track attendance, and review hours.</p>
          </div>
          <button className="button ghost" onClick={logout}>Logout</button>
        </header>

        {message && <p className="message">{message}</p>}

        <section className="stats">
          <div className="stat">
            <div className="stat-label">Total Employees</div>
            <div className="stat-value">{employees.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Active Employees</div>
            <div className="stat-value">{activeCount}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Admins</div>
            <div className="stat-value">{adminCount}</div>
          </div>
        </section>

        <section className="grid grid-2">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">{selectedEmployee ? 'Update Employee' : 'Add Employee'}</h3>
            </div>
            <EmployeeForm
              onSubmit={handleCreateOrUpdate}
              selectedEmployee={selectedEmployee}
              onCancel={() => setSelectedEmployee(null)}
            />
          </div>
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Employee List</h3>
              <span className="muted">{employees.length} total</span>
            </div>
            <ul className="list">
              {employees.map((employee) => (
                <li key={employee.id} className="list-item">
                  <div>
                    <strong>{employee.name}</strong>
                    <div className="muted">{employee.email}</div>
                    <div className="muted">{employee.role} · {employee.isActive ? 'Active' : 'Inactive'}</div>
                  </div>
                  <div className="list-actions">
                    <button className="button" onClick={() => setSelectedEmployee(employee)}>Edit</button>
                    {employee.isActive && (
                      <button className="button ghost" onClick={() => handleDeactivate(employee)}>Deactivate</button>
                    )}
                    <button className="button ghost" onClick={() => handleDelete(employee)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Day-wise Attendance</h3>
          </div>
          <div className="toolbar">
            <input className="input" type="date" value={day} onChange={(e) => setDay(e.target.value)} />
            <button className="button primary" onClick={handleDaySearch}>Load</button>
          </div>
          {dayList.length > 0 ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Status</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {dayList.map((row) => (
                  <tr key={row.userId}>
                    <td>{row.name}</td>
                    <td>
                      <span className={`pill ${row.status === 'PRESENT' ? 'present' : 'absent'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.totalHours}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="muted">No data loaded.</p>
          )}
        </section>

        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Employee Attendance History</h3>
          </div>
          <div className="toolbar">
            <select className="select" value={historyEmployeeId} onChange={(e) => setHistoryEmployeeId(e.target.value)}>
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
            <input className="input" type="month" value={historyMonth} onChange={(e) => setHistoryMonth(e.target.value)} />
            <button className="button primary" onClick={handleHistorySearch}>Load</button>
          </div>
          <p className="muted">Total Hours: {historyTotal}</p>
          <AttendanceTable rows={history} />
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
