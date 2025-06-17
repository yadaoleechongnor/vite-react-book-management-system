"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";
import AdminLayout from "../dashboard/adminLayout";
import { authenticatedFetch } from '../../utils/auth';
import { API_BASE_URL } from '../../utils/api';
import { useTranslation } from 'react-i18next';

export default function DepartmentPage() {
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const { t } = useTranslation();

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

    const handleAddDepartment = async () => {
        Swal.fire({
            title: t('admin.department.addDepartment'),
            html: `
                <input type="text" id="department-name" class="swal2-input" placeholder="${t('admin.department.enterDepartmentName')}">
                <select id="faculty-select" class="swal2-input">
                    ${faculties.map(faculty => `<option value="${faculty._id}">${faculty.faculties_name}</option>`).join('')}
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: t('admin.department.add'),
            preConfirm: async () => {
                try {
                    const name = document.getElementById('department-name').value;
                    const facultyId = document.getElementById('faculty-select').value;

                    const response = await authenticatedFetch(`${API_BASE_URL}/departments/`, {
                        method: 'POST',
                        body: JSON.stringify({
                            department_name: name,
                            faculties_id: facultyId
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        setDepartments([...departments, result.data.department]);
                        Swal.fire(t('admin.success'), t('admin.department.addSuccess'), 'success');
                    } else {
                        throw new Error(result.message || 'Add failed');
                    }
                } catch (error) {
                    console.error(error);
                    Swal.fire(t('admin.error'), t('admin.department.addError'), 'error');
                }
            }
        });
    };

    const handleDeleteDepartment = (id) => {
        Swal.fire({
            title: t('admin.department.confirmDelete'),
            text: t('admin.department.deleteWarning'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('admin.department.confirm'),
            cancelButtonText: t('admin.department.cancel')
        }).then((result) => {
            if (result.isConfirmed) {
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3YzE3MmU4OWQ5Njc5MWI5OTRmMTFmNyIsImlhdCI6MTc1MDE0ODYxOCwiZXhwIjoxNzUyNzQwNjE4fQ.UT6Q_1YDhR8TItJVxVD2eIvZM3SGpxlrPNwxCv-jABU");

                const requestOptions = {
                    method: "DELETE",
                    headers: myHeaders,
                    redirect: "follow"
                };

                fetch(`${API_BASE_URL}/departments/${id}`, requestOptions)
                    .then((response) => response.text())
                    .then((result) => {
                        const parsedResult = JSON.parse(result);
                        if (parsedResult.success) {
                            setDepartments(departments.filter(department => department._id !== id));
                            Swal.fire({
                                title: t('admin.department.deleted'),
                                text: t('admin.department.deleteSuccess'),
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            });
                        } else {
                            throw new Error(parsedResult.message || 'Delete failed');
                        }
                    })
                    .catch((error) => {
                        console.error(error);
                        Swal.fire(t('admin.error'), t('admin.department.deleteError'), 'error');
                    });
            }
        });
    };

    const handleEditDepartment = (id, currentName, currentFacultyId) => {
        Swal.fire({
            title: t('admin.department.editDepartment'),
            html: `
                <input type="text" id="department-name" class="swal2-input" value="${currentName}">
                <select id="faculty-select" class="swal2-input">
                    ${faculties.map(faculty => 
                        `<option value="${faculty._id}" ${faculty._id === currentFacultyId ? 'selected' : ''}>
                            ${faculty.faculties_name}
                        </option>`
                    ).join('')}
                </select>
            `,
            showCancelButton: true,
            confirmButtonText: t('admin.department.update'),
            preConfirm: async () => {
                try {
                    const name = document.getElementById('department-name').value;
                    const facultyId = document.getElementById('faculty-select').value;

                    const response = await authenticatedFetch(`${API_BASE_URL}/departments/${id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            department_name: name,
                            faculties_id: facultyId
                        })
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        setDepartments(departments.map(department => 
                            department._id === id ? result.data.department : department
                        ));
                        Swal.fire(t('admin.success'), t('admin.department.updateSuccess'), 'success');
                    } else {
                        throw new Error(result.message || 'Update failed');
                    }
                } catch (error) {
                    console.error(error);
                    Swal.fire(t('admin.error'), t('admin.department.updateError'), 'error');
                }
            }
        });
    };

    return (
        <AdminLayout>
            <div className="p-6 w-full">
                <h1 className="text-2xl font-bold mb-4">{t('admin.department.title')}</h1>
                <p className="mb-6">{t('admin.department.welcome')}</p>
                <div className="flex justify-end">
                    <button 
                        className="hover:shadow-2xl p-4 border rounded-full bg-gradient-to-tr from-sky-300 to-sky-500 text-white font-bold hover:bg-gradient-to-tl hover:from-sky-300 hover:to-sky-500 cursor-pointer"
                        onClick={handleAddDepartment}
                    >
                        {t('admin.department.addDepartment')}
                    </button>
                </div>
                <div className="p-6 bg-white border rounded-lg mt-16 shadow-2xl">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-center">{t('admin.department.departmentName')}</th>
                                <th className="py-2 px-4 border-b text-center">{t('admin.department.faculty')}</th>
                                <th className="py-2 px-4 border-b text-center hidden md:table-cell">{t('admin.department.createdAt')}</th>
                                <th className="py-2 px-4 border-b text-center hidden lg:table-cell">{t('admin.department.updatedAt')}</th>
                                <th className="py-2 px-4 border-b text-center">{t('admin.common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {departments.map((department) => (
                                <tr key={department._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b text-center">{department.department_name}</td>
                                    <td className="py-2 px-4 border-b text-center">{department.faculties_id?.faculties_name}</td>
                                    <td className="py-2 px-4 border-b text-center hidden md:table-cell">{new Date(department.createdAt).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border-b text-center hidden lg:table-cell">{new Date(department.updatedAt).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button 
                                            className="text-blue-500 hover:text-blue-700 mr-2"
                                            onClick={() => handleEditDepartment(department._id, department.department_name, department.faculties_id?._id)}
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