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
    <div className="app-shell">
      <div className="page">
        <header className="page-header">
          <div>
            <h2>Welcome, {user?.name}</h2>
            <p className="muted">Track your check-ins and review monthly hours.</p>
          </div>
          <button className="button ghost" onClick={logout}>Logout</button>
        </header>

        {message && <p className="message">{message}</p>}

        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Today</h3>
          </div>
          <div className="toolbar">
            <button className="button primary" onClick={handleCheckIn}>Check In</button>
            <button className="button" onClick={handleCheckOut}>Check Out</button>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h3 className="card-title">Attendance History</h3>
            <span className="muted">Total Hours: {totalHours}</span>
          </div>
          <div className="toolbar">
            <label className="muted">Filter by month</label>
            <input className="input" type="month" value={month} onChange={(e) => handleMonthChange(e.target.value)} />
          </div>
          <AttendanceTable rows={attendance} />
        </section>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
