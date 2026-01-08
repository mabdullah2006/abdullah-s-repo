import React from 'react';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 10);
}

function formatTime(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString();
}

function AttendanceTable({ rows }) {
  if (!rows || rows.length === 0) {
    return <p className="muted">No attendance records found.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Status</th>
          <th>Check In</th>
          <th>Check Out</th>
          <th>Total Hours</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{formatDate(row.date)}</td>
            <td>
              <span className={`pill ${row.status === 'PRESENT' ? 'present' : 'absent'}`}>
                {row.status}
              </span>
            </td>
            <td>{formatTime(row.timeLog?.checkIn)}</td>
            <td>{formatTime(row.timeLog?.checkOut)}</td>
            <td>{row.totalHours}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default AttendanceTable;
