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
    return <p>No attendance records found.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr>
          <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Date</th>
          <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Status</th>
          <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Check In</th>
          <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Check Out</th>
          <th style={{ borderBottom: '1px solid #ccc', textAlign: 'left' }}>Total Hours</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td style={{ padding: '6px 0' }}>{formatDate(row.date)}</td>
            <td>{row.status}</td>
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
