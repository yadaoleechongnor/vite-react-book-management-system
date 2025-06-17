"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";
import AdminLayout from "../dashboard/adminLayout";
import { authenticatedFetch } from '../../utils/auth';
import { API_BASE_URL } from '../../utils/api';
import { useTranslation } from 'react-i18next';

export default function FacultyPage() {
    const [faculties, setFaculties] = useState([]);
    const { t } = useTranslation();

    useEffect(() => {
        const requestOptions = {
            method: "GET",
            redirect: "follow"
        };

        fetch(`${API_BASE_URL}/faculties/`, requestOptions)
            .then((response) => response.json())
            .then((result) => setFaculties(result.data.faculties))
            .catch((error) => console.error(error));
    }, []);

    const handleAddFaculty = async () => {
        Swal.fire({
            title: t('admin.faculty.addFaculty'),
            input: 'text',
            inputLabel: t('admin.faculty.facultyName'),
            inputPlaceholder: t('admin.faculty.enterFacultyName'),
            showCancelButton: true,
            confirmButtonText: t('admin.faculty.add'),
            preConfirm: async (name) => {
                try {
                    const response = await authenticatedFetch(`${API_BASE_URL}/faculties/`, {
                        method: 'POST',
                        body: JSON.stringify({
                            faculties_name: name
                        })
                    });

                    const result = await response.json();

                    if (result.success) {
                        setFaculties([...faculties, result.data.faculty]);
                        Swal.fire(t('admin.success'), t('admin.faculty.addSuccess'), 'success');
                    } else {
                        Swal.fire(t('admin.error'), t('admin.faculty.addError'), 'error');
                    }
                } catch (error) {
                    Swal.fire(t('admin.error'), t('admin.faculty.addError'), 'error');
                }
            }
        });
    };

    const handleDeleteFaculty = (id) => {
        Swal.fire({
            title: t('admin.faculty.confirmDelete'),
            text: t('admin.faculty.deleteWarning'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: t('admin.faculty.confirm'),
            cancelButtonText: t('admin.faculty.cancel')
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

                fetch(`${API_BASE_URL}/faculties/${id}`, requestOptions)
                    .then((response) => response.text())
                    .then((result) => {
                        const parsedResult = JSON.parse(result);
                        if (parsedResult.success) {
                            setFaculties(faculties.filter(faculty => faculty._id !== id));
                            Swal.fire({
                                title: t('admin.faculty.deleted'),
                                text: t('admin.faculty.deleteSuccess'),
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
                        Swal.fire(t('admin.error'), t('admin.faculty.deleteError'), 'error');
                    });
            }
        });
    };

    const handleEditFaculty = (id, currentName) => {
        Swal.fire({
            title: t('admin.faculty.editFaculty'),
            input: 'text',
            inputLabel: t('admin.faculty.facultyName'),
            inputValue: currentName,
            showCancelButton: true,
            confirmButtonText: t('admin.faculty.update'),
            preConfirm: async (name) => {
                try {
                    const response = await authenticatedFetch(`${API_BASE_URL}/faculties/${id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                            faculties_name: name
                        })
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        setFaculties(faculties.map(faculty => 
                            faculty._id === id ? {...faculty, faculties_name: name} : faculty
                        ));
                        Swal.fire(t('admin.success'), t('admin.faculty.updateSuccess'), 'success');
                    } else {
                        throw new Error(result.message || 'Update failed');
                    }
                } catch (error) {
                    console.error(error);
                    Swal.fire(t('admin.error'), t('admin.faculty.updateError'), 'error');
                }
            }
        });
    };

    return (
        <AdminLayout>
            <div className="p-6 w-full">
                <h1 className="text-2xl font-bold mb-4">{t('admin.faculty.title')}</h1>
                <p className="mb-6">{t('admin.faculty.welcome')}</p>
                <div className="flex justify-end">
                    <button 
                        className="hover:shadow-2xl p-4 border rounded-full bg-gradient-to-tr from-sky-300 to-sky-500 text-white font-bold hover:bg-gradient-to-tl hover:from-sky-300 hover:to-sky-500 cursor-pointer"
                        onClick={handleAddFaculty}
                    >
                        {t('admin.faculty.addFaculty')}
                    </button>
                </div>
                <div className="p-6 bg-white border rounded-lg mt-16 shadow-2xl ">
                    <table className="min-w-full bg-white">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="py-2 px-4 border-b text-center">{t('admin.faculty.facultyName')}</th>
                                <th className="py-2 px-4 border-b text-center hidden md:table-cell">{t('admin.faculty.createdAt')}</th>
                                <th className="py-2 px-4 border-b text-center hidden lg:table-cell">{t('admin.faculty.updatedAt')}</th>
                                <th className="py-2 px-4 border-b text-center">{t('admin.common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {faculties.map((faculty) => (
                                <tr key={faculty._id} className="hover:bg-gray-50">
                                    <td className="py-2 px-4 border-b text-center">{faculty.faculties_name}</td>
                                    <td className="py-2 px-4 border-b text-center hidden md:table-cell">{new Date(faculty.createdAt).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border-b text-center hidden lg:table-cell">{new Date(faculty.updatedAt).toLocaleDateString()}</td>
                                    <td className="py-2 px-4 border-b text-center">
                                        <button 
                                            className="text-blue-500 hover:text-blue-700 mr-2"
                                            onClick={() => handleEditFaculty(faculty._id, faculty.faculties_name)}
                                        >
                                            <FaEdit />
                                        </button>
                                        <button 
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => handleDeleteFaculty(faculty._id)}
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