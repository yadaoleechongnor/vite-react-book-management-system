"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";
import AdminLayout from "../dashboard/adminLayout";
import { API_BASE_URL } from "../../utils/api";

function saveToken(token) {
    localStorage.setItem('authToken', token);
}

export default function BranchPage() {
    const { t } = useTranslation();
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
                if (result.data && result.data.branches) {
                    setBranches(result.data.branches);
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
                setDepartments(result.data.departments);
            })
            .catch((error) => console.error(error));

    }, []);

    const countBranches = () => {
        return branches ? branches.length : 0;
    };

    const handleAddBranch = () => {
        Swal.fire({
            title: t('admin.branch.addBranch'),
            html: `
                <div class="flex flex-col space-y-4">
                    <div>
                        <label for="branch-name" class="block font-medium text-gray-700">${t('admin.branch.name')}</label>
                        <input type="text" id="branch-name" class="mt-1 h-12 p-2 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm" placeholder="${t('admin.branch.enterName')}">
                    </div>
                    <div>
                        <label for="department-select" class="block text-sm font-medium text-gray-700">${t('admin.branch.department')}</label>
                        <select id="department-select" class="mt-1 block w-full h-12 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 sm:text-sm">
                            ${departments ? departments.map(department => `<option value="${department._id}">${department.department_name}</option>`).join('') : ''}
                        </select>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: t('admin.common.add'),
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
                                title: t('admin.common.success'),
                                text: t('admin.branch.addSuccess'),
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        } else {
                            Swal.fire(t('admin.common.error'), t('admin.branch.addError'), 'error');
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        Swal.fire(t('admin.common.error'), t('admin.branch.addError'), 'error');
                    });
            }
        });
    };

    const handleDeleteBranch = (id) => {
        Swal.fire({
            title: t('admin.common.deleteWarning'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: t('admin.common.yesDelete'),
            cancelButtonText: t('admin.common.noCancel')
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
                                title: t('admin.common.deleted'),
                                text: t('admin.branch.deleteSuccess'),
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
                            Swal.fire(t('admin.common.error'), t('admin.branch.deleteError'), 'error');
                        }
                    })
                    .catch((error) => {
                        Swal.fire(t('admin.common.error'), t('admin.branch.deleteError'), 'error');
                    });
            }
        });
    };

    const handleEditBranch = (id, currentName, currentDepartmentId) => {
        Swal.fire({
            title: t('admin.branch.editBranch'),
            html: `
                <div class="flex flex-col space-y-4">
                    <div>
                        <label for="branch-name" class="block text-sm text-left font-medium text-gray-700">${t('admin.branch.name')}</label>
                        <input type="text" id="branch-name" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm px-3 focus:ring-sky-500 focus:border-sky-500 text-base" value="${currentName}">
                    </div>
                    <div>
                        <label for="department-select" class="block text-left font-medium text-gray-700">${t('admin.branch.department')}</label>
                        <select id="department-select" class="mt-1 block w-full h-12 border border-gray-300 rounded-md shadow-sm px-3 focus:ring-sky-500 focus:border-sky-500 text-base">
                            ${departments ? departments.map(department => `<option value="${department._id}" ${department._id === currentDepartmentId ? 'selected' : ''}>${department.department_name}</option>`).join('') : ''}
                        </select>
                    </div>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: t('admin.common.update'),
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
                            Swal.fire(t('admin.common.success'), t('admin.branch.updateSuccess'), 'success');
                        } else {
                            Swal.fire(t('admin.common.error'), t('admin.branch.updateError'), 'error');
                        }
                    })
                    .catch((error) => {
                        console.error('Error:', error);
                        Swal.fire(t('admin.common.error'), t('admin.branch.updateError'), 'error');
                    });
            }
        });
    };

    return (
        <AdminLayout>
            <div className="p-6 w-full">
                <h1 className="text-2xl font-bold mb-4">{t('admin.branch.title')}</h1>
                <button 
                    className="mb-4 hover:shadow-2xl p-4 border rounded-full bg-gradient-to-tr from-sky-300 to-sky-500"
                    onClick={handleAddBranch}
                >
                    {t('admin.branch.addBranch')}
                </button>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr>
                            <th>{t('admin.branch.branchName')}</th>
                            <th>{t('admin.branch.department')}</th>
                            <th>{t('admin.common.actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {branches && branches.length > 0 ? branches.map((branch, index) => (
                            <tr key={branch._id} className="border-t hover:bg-gray-50">
                                <td className="py-3 px-4">{branch.branch_name}</td>
                                <td className="py-3 px-4">{branch.department_id?.department_name || t('admin.common.na')}</td>
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
                                <td colSpan="3" className="py-4 text-center text-gray-500">{t('admin.branch.noBranches')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}



