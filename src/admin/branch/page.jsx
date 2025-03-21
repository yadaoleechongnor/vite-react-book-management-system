"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";
import AdminLayout from "../dashboard/adminLayout";
import { API_BASE_URL } from "../../utils/api";

function saveToken(token) {
    localStorage.setItem('authToken', token);
}

export default function BranchPage() {
    const [branches, setBranches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        fetch(`${API_BASE_URL}/branches/`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log("Branches response:", result);
                if (result.data && result.data.branches) {
                    console.log("Branches fetched:", result.data.branches);
                    setBranches(result.data.branches);
                } else {
                    console.log("No branches found in response");
                }
                setLoading(false);
            })
            .catch((error) => {
                console.error(error);
                setLoading(false);
            });

        fetch(`${API_BASE_URL}/departments/`, requestOptions)
            .then((response) => response.json())
            .then((result) => {
                console.log("Departments fetched:", result.data.departments);
                setDepartments(result.data.departments);
            })
            .catch((error) => console.error(error));

        // fetch(`${API_BASE_URL}/faculties/`, requestOptions)
        //     .then((response) => response.json())
        //     .then((result) => {
        //         console.log("Faculties fetched:", result.data.faculties);
        //         setFaculties(result.data.faculties);
        //     })
        //     .catch((error) => console.error(error));
    }, []);

    const countBranches = () => {
        return branches ? branches.length : 0;
    };

    const handleAddBranch = () => {
        Swal.fire({
            title: 'Add Branch',
            html: `
                <div class="flex flex-col space-y-4">
                    <div>
                        <label for="branch-name" class="block font-medium text-gray-700">Branch Name</label>
                        <input type="text" id="branch-name" class="mt-1 h-12 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="Enter branch name">
                    </div>
                    <div>
                        <label for="department-select" class="block text-sm font-medium text-gray-700">Select Department</label>
                        <select id="department-select" class="mt-1 block w-full h-12 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                            ${departments ? departments.map(department => `<option value="${department._id}">${department.department_name}</option>`).join('') : ''}
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
                const name = document.getElementById('branch-name').value;
                const departmentId = document.getElementById('department-select').value;
                const token = localStorage.getItem('authToken');
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", `Bearer ${token}`);

                const raw = JSON.stringify({
                    "branch_name": name,
                    "department_id": departmentId
                });

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                return fetch(`${API_BASE_URL}/branches/`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.success) {
                            setBranches([...branches, result.data.branch]);
                            Swal.fire({
                                title: 'Success',
                                text: 'Branch added successfully',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        } else {
                            Swal.fire('Error', 'Failed to add branch', 'error');
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        Swal.fire('Error', 'Failed to add branch', 'error');
                    });
            }
        });
    };

    const handleDeleteBranch = (id) => {
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

                fetch(`${API_BASE_URL}/branches/${id}`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.success) {
                            setBranches(branches.filter(branch => branch._id !== id));
                            Swal.fire({
                                title: 'Deleted!',
                                text: 'Branch has been deleted.',
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
                            Swal.fire('Error', 'Failed to delete branch', 'error');
                        }
                    })
                    .catch((error) => {
                        Swal.fire('Error', 'Failed to delete branch', 'error');
                    });
            }
        });
    };

    const handleEditBranch = (id, currentName, currentDepartmentId) => {
        Swal.fire({
            title: 'Edit Branch',
            html: `
                <div class="flex flex-col space-y-4">
                    <div>
                        <label for="branch-name" class="block text-sm text-left font-medium text-gray-700">Branch Name</label>
                        <input type="text" id="branch-name" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm px-3 focus:ring-sky-500 focus:border-sky-500 text-base" value="${currentName}">
                    </div>
                    <div>
                        <label for="department-select" class="block text-left font-medium text-gray-700">Select Department</label>
                        <select id="department-select" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm px-3 focus:ring-sky-500 focus:border-sky-500 text-base">
                            ${departments ? departments.map(department => `<option value="${department._id}" ${department._id === currentDepartmentId ? 'selected' : ''}>${department.department_name}</option>`).join('') : ''}
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
                const name = document.getElementById('branch-name').value;
                const departmentId = document.getElementById('department-select').value;
                const token = localStorage.getItem('authToken');
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", `Bearer ${token}`);

                const raw = JSON.stringify({
                    "branch_name": name,
                    "department_id": departmentId
                });

                const requestOptions = {
                    method: "PATCH",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                return fetch(`${API_BASE_URL}/branches/${id}`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.success) {
                            setBranches(branches.map(branch => branch._id === id ? result.data.branch : branch));
                            Swal.fire('Success', 'Branch updated successfully', 'success');
                        } else {
                            Swal.fire('Error', 'Failed to update branch', 'error');
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        Swal.fire('Error', 'Failed to update branch', 'error');
                    });
            }
        });
    };

    return (
                <AdminLayout>
                   <div className="flex-1 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Branch Management</h1>
                    <button 
                        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-700"
                        onClick={handleAddBranch}
                    >
                        + Add Branch
                    </button>
                </div>
                
                <p className="mb-4 text-gray-600">Total Branches: {countBranches()}</p>
                
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="bg-white p-4 rounded-lg shadow-md">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="py-2 px-4 text-left">#</th>
                                    <th className="py-2 px-4 text-left">Branch</th>
                                    <th className="py-2 px-4 text-left">Department</th>
                                    <th className="py-2 px-4 text-left">Faculty</th>
                                    <th className="py-2 px-4 text-left">Created At</th>
                                    <th className="py-2 px-4 text-left">Updated At</th>
                                    <th className="py-2 px-4 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branches && branches.length > 0 ? branches.map((branch, index) => (
                                    <tr key={branch._id} className="border-t hover:bg-gray-50">
                                        <td className="py-3 px-4">{index + 1}</td>
                                        <td className="py-3 px-4">{branch.branch_name}</td>
                                        <td className="py-3 px-4">{branch.department_id?.department_name || 'N/A'}</td>
                                        <td className="py-3 px-4">{branch.department_id?.faculties_id?.faculties_name || 'N/A'}</td>
                                        <td className="py-3 px-4">{new Date(branch.createdAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4">{new Date(branch.updatedAt).toLocaleDateString()}</td>
                                        <td className="py-3 px-4 flex space-x-2">
                                            <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEditBranch(branch._id, branch.branch_name, branch.department_id._id)}>
                                                <FaEdit />
                                            </button>
                                            <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteBranch(branch._id)}>
                                                <FaTrash />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="7" className="py-4 text-center text-gray-500">No branches available</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
                </AdminLayout>
            );
        };



