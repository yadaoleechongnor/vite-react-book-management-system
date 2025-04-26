import React, { useState } from 'react';

function AdminForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div>
        <label 
          htmlFor="admin-name" 
          className="block text-sm font-medium text-gray-700"
        >
          Name
        </label>
        <input
          id="admin-name"
          type="text"
          name="name"
          autoComplete="name"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
      </div>

      <div>
        <label 
          htmlFor="admin-email" 
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          name="email"
          autoComplete="email"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>

      <div>
        <label 
          htmlFor="admin-phone" 
          className="block text-sm font-medium text-gray-700"
        >
          Phone Number
        </label>
        <input
          id="admin-phone"
          type="tel"
          name="phone_number"
          autoComplete="tel"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.phone_number}
          onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
        />
      </div>

      <div>
        <label 
          htmlFor="admin-password" 
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          name="password"
          autoComplete="new-password"
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
        />
      </div>

      <button
        type="submit"
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Add Admin
      </button>
    </form>
  );
}

export default AdminForm;
