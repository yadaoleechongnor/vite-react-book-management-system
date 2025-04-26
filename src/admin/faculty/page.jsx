"use client";

import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { FaTrash, FaEdit } from "react-icons/fa";
import AdminLayout from "../dashboard/adminLayout";
import { API_BASE_URL } from "../../utils/api";

export default function FacultyPage() {
    const [faculties, setFaculties] = useState([]);

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

    const handleAddFaculty = () => {
        Swal.fire({
            title: 'Add Faculty',
            input: 'text',
            inputLabel: 'Faculty Name',
            inputPlaceholder: 'Enter faculty name',
            showCancelButton: true,
            confirmButtonText: 'Add',
            preConfirm: (name) => {
                const token = localStorage.getItem('authToken');
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", `Bearer ${token}`);

                const raw = JSON.stringify({
                    "faculties_name": name
                });

                const requestOptions = {
                    method: "POST",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                return fetch(`${API_BASE_URL}/faculties/`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.success) {
                            setFaculties([...faculties, result.data.faculty]);
                            Swal.fire('Success', 'Faculty added successfully', 'success');
                        } else {
                            Swal.fire('Error', 'Failed to add faculty', 'error');
                        }
                    })
                    .catch((error) => {
                        Swal.fire('Error', 'Failed to add faculty', 'error');
                    });
            }
        });
    };

    const handleDeleteFaculty = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!'
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

                fetch(`${API_BASE_URL}/faculties/${id}`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.success) {
                            setFaculties(faculties.filter(faculty => faculty._id !== id));
                            Swal.fire({
                                title: 'Deleted!',
                                text: 'Faculty has been deleted.',
                                icon: 'success',
                                timer: 2000,
                                showConfirmButton: false
                            }).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire('Error', 'Failed to delete faculty', 'error');
                        }
                    })
                    .catch((error) => {
                        Swal.fire('Error', 'Failed to delete faculty', 'error');
                    });
            }
        });
    };

    const handleEditFaculty = (id, currentName) => {
        Swal.fire({
            title: 'Edit Faculty',
            input: 'text',
            inputLabel: 'Faculty Name',
            inputValue: currentName,
            showCancelButton: true,
            confirmButtonText: 'Update',
            preConfirm: (name) => {
                const token = localStorage.getItem('authToken');
                const myHeaders = new Headers();
                myHeaders.append("Content-Type", "application/json");
                myHeaders.append("Authorization", `Bearer ${token}`);

                const raw = JSON.stringify({
                    "faculties_name": name
                });

                const requestOptions = {
                    method: "PATCH",
                    headers: myHeaders,
                    body: raw,
                    redirect: "follow"
                };

                return fetch(`${API_BASE_URL}/faculties/${id}`, requestOptions)
                    .then((response) => response.json())
                    .then((result) => {
                        if (result.success) {
                            setFaculties(faculties.map(faculty => faculty._id === id ? result.data.faculty : faculty));
                            Swal.fire('Success', 'Faculty updated successfully', 'success');
                        } else {
                            Swal.fire('Error', 'Failed to update faculty', 'error');
                        }
                    })
                    .catch((error) => {
                        Swal.fire('Error', 'Failed to update faculty', 'error');
                    });
            }
        });
    };

    return (
        <AdminLayout>
            <div className="p-6 w-full">
                <h1 className="text-2xl font-bold mb-4">Faculty Page</h1>
                <p className="mb-6">Welcome to the Faculty Page.</p>
                <div className="flex justify-end">
                    <button 
                        className="hover:shadow-2xl p-4 border rounded-full bg-gradient-to-tr from-sky-300 to-sky-500 text-white font-bold hover:bg-gradient-to-tl hover:from-sky-300 hover:to-sky-500 cursor-pointer"
                        onClick={handleAddFaculty}
                    >
                        Add Faculty
                    </button>
                </div>
                <div className="p-6 bg-white border rounded-lg mt-16 shadow-2xl ">
                <table className="min-w-full bg-white  border-gray-200">
                    <thead>
                        <tr className="bg-gray-100">
                            {/* <th className="py-2 px-4 border-b">ID</th> */}
                            <th className="py-2 px-4 border-b text-center">Name</th>
                            <th className="py-2 px-4 border-b text-center hidden md:table-cell">Created At</th>
                            <th className="py-2 px-4 border-b text-center hidden lg:table-cell">Updated At</th>
                            <th className="py-2 px-4 border-b text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {faculties.map((faculty) => (
                            <tr key={faculty._id} className="hover:bg-gray-50">
                                {/* <td className="py-2 px-4 border-b text-center">{faculty._id}</td> */}
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