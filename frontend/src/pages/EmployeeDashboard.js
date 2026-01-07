import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import AttendanceTable from '../components/AttendanceTable';

function EmployeeDashboard() {
  const { logout, user } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [totalHours, setTotalHours] = useState(0);
  const [message, setMessage] = useState('');
  const [month, setMonth] = useState('');

  const loadAttendance = async (selectedMonth) => {
    const query = selectedMonth ? `?month=${selectedMonth}` : '';
    const response = await api.get(`/attendance/me${query}`);
    setAttendance(response.data.attendance || []);
    setTotalHours(response.data.totalHours || 0);
  };

  useEffect(() => {
    loadAttendance(month);
  }, []);

  const handleCheckIn = async () => {
    setMessage('');
    try {
      await api.post('/attendance/check-in');
      setMessage('Checked in successfully.');
      await loadAttendance(month);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async () => {
    setMessage('');
    try {
      await api.post('/attendance/check-out');
      setMessage('Checked out successfully.');
      await loadAttendance(month);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Check-out failed');
    }
  };

  const handleMonthChange = async (value) => {
    setMonth(value);
    await loadAttendance(value);
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Welcome, {user?.name}</h2>
        <button onClick={logout}>Logout</button>
      </header>

      {message && <p>{message}</p>}

      <section style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
        <button onClick={handleCheckIn}>Check In</button>
        <button onClick={handleCheckOut}>Check Out</button>
      </section>

      <section style={{ marginTop: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px' }}>Filter by Month</label>
        <input type="month" value={month} onChange={(e) => handleMonthChange(e.target.value)} />
      </section>

      <section style={{ marginTop: '20px' }}>
        <p>Total Hours: {totalHours}</p>
        <AttendanceTable rows={attendance} />
      </section>
    </div>
  );
}

export default EmployeeDashboard;
