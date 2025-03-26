"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";
import AdminLayout from "../dashboard/adminLayout";
import { API_BASE_URL } from "../../utils/api";

export default function DepartmentPage() {
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);

    useEffect(() => {
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        fetch(`${API_BASE_URL}/departments/`, requestOptions)
            .then((response) => response.json())
            .then((result) => setDepartments(result.data.departments))
            .catch((error) => console.error(error));

        fetch(`${API_BASE_URL}/faculties/`, requestOptions)
            .then((response) => response.json())
            .then((result) => setFaculties(result.data.faculties))
            .catch((error) => console.error(error));
    }, []);

    const countDepartments = () => {
        return departments.length;
    };

    const handleAddDepartment = () => {
        Swal.fire({
            title: 'Add Department',
            html: `
                <div class="flex flex-col space-y-4">
                    <div>
                        <label for="department-name" class="block font-medium text-gray-700">Department Name</label>
                        <input type="text" id="department-name" class="mt-1 h-12 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="Enter department name">
                    </div>
                    <div>
                        <label for="faculty-select" class="block text-sm font-medium text-gray-700">Select Faculty</label>
                        <select id="faculty-select" class="mt-1 block w-full h-12 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                            ${faculties.map(faculty => `<option value="${faculty._id}">${faculty.faculties_name}</option>`).join('')}
                        </select>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Add',
            customClass: {
                popup: 'bg-white rounded-lg p-6 shadow-lg',
                title: 'text-xl font-semibold text-gray-900',
                confirmButton: 'bg-sky-500 text-white rounded-md px-4 py-2 hover:bg-sky-600 focus:ring-2 focus:ring-offset-2 focus:ring-sky-500',
                cancelButton: 'bg-gray-300 text-gray-900 rounded-md px-4 py-2 hover:bg-gray-400 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            },
            preConfirm: () => {
                const name = document.getElementById('department-name').value;
                const facultyId = document.getElementById('faculty-select').value;
                const token = localStorage.getItem('authToken');
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", `Bearer ${token}`);

                const raw = JSON.stringify({
                    "department_name": name,
                    "faculties_id": facultyId
                });

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                return fetch(`${API_BASE_URL}/departments/`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.success) {
                            setDepartments([...departments, result.data.department]);
                            Swal.fire({
                                title: 'Success',
                                text: 'Department added successfully',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        } else {
                            Swal.fire('Error', 'Failed to add department', 'error');
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        Swal.fire('Error', 'Failed to add department', 'error');
                    });
            }
        });
    };

    const handleDeleteDepartment = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
            customClass: {
                popup: 'bg-white rounded-lg p-6 shadow-lg',
                title: 'text-xl font-semibold text-gray-900',
                confirmButton: 'bg-red-500 text-white rounded-md px-4 py-2 hover:bg-red-600 focus:ring-2 focus:ring-offset-2 focus:ring-red-500',
                cancelButton: 'bg-gray-300 text-gray-900 rounded-md px-4 py-2 hover:bg-gray-400 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                const token = localStorage.getItem('authToken');
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", `Bearer ${token}`);

                const requestOptions = {
                    method: "DELETE",
                    headers: myHeaders,
                    redirect: "follow"
                };

                fetch(`${API_BASE_URL}/departments/${id}`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.success) {
                            setDepartments(departments.filter(department => department._id !== id));
                            Swal.fire({
                                title: 'Deleted!',
                                text: 'Department has been deleted.',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false,
                                customClass: {
                                    popup: 'bg-white rounded-lg p-6 shadow-lg',
                                    title: 'text-xl font-semibold text-gray-900'
                                }
                            }).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire('Error', 'Failed to delete department', 'error');
                        }
                    })
                    .catch((error) => {
                        Swal.fire('Error', 'Failed to delete department', 'error');
                    });
            }
        });
    };

    const handleEditDepartment = (id, currentName, currentFacultyId) => {
        Swal.fire({
            title: 'Edit Department',
            html: `
                <div class="flex flex-col space-y-4">
                    <div>
                        <label for="department-name" class="block text-sm text-left font-medium text-gray-700">Department Name</label>
                        <input type="text" id="department-name" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm px-3 focus:ring-sky-500 focus:border-sky-500 text-base" value="${currentName}">
                    </div>
                    <div>
                        <label for="faculty-select" class="block text-left font-medium text-gray-700">Select Faculty</label>
                        <select id="faculty-select" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm px-3 focus:ring-sky-500 focus:border-sky-500 text-base">
                            ${faculties.map(faculty => `<option value="${faculty._id}" ${faculty._id === currentFacultyId ? 'selected' : ''}>${faculty.faculties_name}</option>`).join('')}
                        </select>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Update',
            customClass: {
                popup: 'bg-white rounded-lg p-6 shadow-lg',
                title: 'text-xl font-semibold text-gray-900',
                confirmButton: 'bg-sky-500 text-white rounded-md px-5 py-2 text-lg hover:bg-sky-600 focus:ring-2 focus:ring-offset-2 focus:ring-sky-500',
                cancelButton: 'bg-gray-300 text-gray-900 rounded-md px-5 py-2 text-lg hover:bg-gray-400 focus:ring-2 focus:ring-offset-2 focus:ring-gray-500'
            },
            preConfirm: () => {
                const name = document.getElementById('department-name').value;
                const facultyId = document.getElementById('faculty-select').value;
                const token = localStorage.getItem('authToken');
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", `Bearer ${token}`);

                const raw = JSON.stringify({
                    "department_name": name,
                    "faculties_id": facultyId
                });

                const requestOptions = {
                    method: "PATCH",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                return fetch(`${API_BASE_URL}/departments/${id}`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.success) {
                            setDepartments(departments.map(department => department._id === id ? result.data.department : department));
                            Swal.fire('Success', 'Department updated successfully', 'success');
                        } else {
                            Swal.fire('Error', 'Failed to update department', 'error');
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        Swal.fire('Error', 'Failed to update department', 'error');
                    });
            }
        });
    };
    

    return (
        <AdminLayout>
            <div className="p-6 w-full">
                <h1 className="text-2xl font-bold mb-4">Department Page</h1>
                <p className="mb-6">Welcome to the Department Page.</p>
                <button 
                    className="hover:shadow-2xl p-2 border rounded-full bg-gradient-to-tr md:p-4  from-sky-300 to-sky-500 text-white font-bold hover:bg-gradient-to-tl hover:from-sky-300 hover:to-sky-500 cursor-pointer"
                    onClick={handleAddDepartment}
                >
                    Add Department
                </button>
                <p className="mt-4">Total Departments: {countDepartments()}</p>
                <div className="overflow-x-auto p-6 rounded-lg border bg-white shadow-2xl mt-8">
                    <table className="min-w-full bg-white border-gray-200">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-start">#</th>
                                <th className="py-2 px-4 border-b">Department</th>
                                <th className="py-2 px-4 border-b md:table-cell hidden">Faculty</th>
                                <th className="py-2 px-4 border-b lg:table-cell hidden">Created At</th>
                                <th className="py-2 px-4 border-b lg:table-cell hidden">Updated At</th>
                                <th className="py-2 px-4 border-b text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((department, index) => (
                                <tr key={department._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b text-center">{index + 1}</td>
                                    <td className="py-2 px-4 border-b">{department.department_name}</td>
                                    <td className="py-2 px-4 border-b md:table-cell hidden">{department.faculties_id?.faculties_name}</td>
                                    <td className="py-2 px-4 border-b text-center lg:table-cell hidden">{new Date(department.createdAt).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border-b text-center lg:table-cell hidden">{new Date(department.updatedAt).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button 
                                            className="text-blue-500 hover:text-blue-700 mr-2"
                                            onClick={() => handleEditDepartment(department._id, department.department_name, department.faculty?._id)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDeleteDepartment(department._id)}
                                        >
                                            <FaTrash />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    );
}