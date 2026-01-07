import React, { useEffect, useState } from 'react';

const initialState = {
  name: '',
  email: '',
  role: 'EMPLOYEE',
  salary: '',
  joinDate: '',
  password: ''
};

function EmployeeForm({ onSubmit, selectedEmployee, onCancel }) {
  const [form, setForm] = useState(initialState);

  useEffect(() => {
    if (selectedEmployee) {
      setForm({
        name: selectedEmployee.name || '',
        email: selectedEmployee.email || '',
        role: selectedEmployee.role || 'EMPLOYEE',
        salary: selectedEmployee.salary || '',
        joinDate: selectedEmployee.joinDate ? selectedEmployee.joinDate.slice(0, 10) : '',
        password: ''
      });
    } else {
      setForm(initialState);
    }
  }, [selectedEmployee]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '8px' }}>
      <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
      <input name="salary" placeholder="Salary" value={form.salary} onChange={handleChange} />
      <input name="joinDate" type="date" value={form.joinDate} onChange={handleChange} />
      <select name="role" value={form.role} onChange={handleChange}>
        <option value="EMPLOYEE">EMPLOYEE</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <input
        name="password"
        placeholder={selectedEmployee ? 'New password (optional)' : 'Password'}
        value={form.password}
        onChange={handleChange}
        type="password"
        required={!selectedEmployee}
      />
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="submit">{selectedEmployee ? 'Update' : 'Add'} Employee</button>
        {selectedEmployee && (
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default EmployeeForm;
