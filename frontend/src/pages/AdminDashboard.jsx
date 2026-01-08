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
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <button onClick={logout}>Logout</button>
      </header>

      {message && <p>{message}</p>}

      <section style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div style={{ border: '1px solid #ddd', padding: '16px' }}>
          <h3>{selectedEmployee ? 'Update Employee' : 'Add Employee'}</h3>
          <EmployeeForm
            onSubmit={handleCreateOrUpdate}
            selectedEmployee={selectedEmployee}
            onCancel={() => setSelectedEmployee(null)}
          />
        </div>
        <div style={{ border: '1px solid #ddd', padding: '16px' }}>
          <h3>Employee List</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {employees.map((employee) => (
              <li key={employee.id} style={{ marginBottom: '10px' }}>
                <strong>{employee.name}</strong> ({employee.email}) - {employee.role} -
                {employee.isActive ? ' Active' : ' Inactive'}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <button onClick={() => setSelectedEmployee(employee)}>Edit</button>
                  {employee.isActive && (
                    <button onClick={() => handleDeactivate(employee)}>Deactivate</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '16px' }}>
        <h3>Day-wise Attendance</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input type="date" value={day} onChange={(e) => setDay(e.target.value)} />
          <button onClick={handleDaySearch}>Load</button>
        </div>
        {dayList.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Employee</th>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Status</th>
                <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Hours</th>
              </tr>
            </thead>
            <tbody>
              {dayList.map((row) => (
                <tr key={row.userId}>
                  <td>{row.name}</td>
                  <td>{row.status}</td>
                  <td>{row.totalHours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No data loaded.</p>
        )}
      </section>

      <section style={{ marginTop: '30px', border: '1px solid #ddd', padding: '16px' }}>
        <h3>Employee Attendance 5 History</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <select value={historyEmployeeId} onChange={(e) => setHistoryEmployeeId(e.target.value)}>
            <option value="">Select employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
          <input type="month" value={historyMonth} onChange={(e) => setHistoryMonth(e.target.value)} />
          <button onClick={handleHistorySearch}>Load</button>
        </div>
        <p>Total Hours: {historyTotal}</p>
        <AttendanceTable rows={history} />
      </section>
    </div>
  );
}

export default AdminDashboard;
