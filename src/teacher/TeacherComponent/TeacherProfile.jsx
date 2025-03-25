import React, { useState, useEffect } from "react";
import { FaUser } from "react-icons/fa";
import { getAuthToken } from "../../utils/auth";
import { API_BASE_URL } from "../../utils/api";

const TeacherProfile = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [profileDetails, setProfileDetails] = useState(null);
    const [branchName, setBranchName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    // Fetch branch name based on branch_id
    const fetchBranchName = async (branchId) => {
        if (!branchId) return null;
        
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            console.log(`Fetching branch with ID: ${branchId}`);
            
            // Use authenticated fetch to get branch details
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);
            
            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow",
            };
            
            // We now know the correct endpoint and data structure
            const endpoint = `${API_BASE_URL || "http://localhost:5000"}/branches/${branchId}`;
            
            const response = await fetch(endpoint, requestOptions);
            
            if (!response.ok) {
                console.error(`Failed to fetch branch data: ${response.status}`);
                return null;
            }
            
            const result = await response.json();
            console.log("Branch API response:", result);
            
            // Extract the branch_name based on the known structure
            if (result.success && result.data && result.data.branch && result.data.branch.branch_name) {
                return result.data.branch.branch_name;
            }
            
            return null;
        } catch (error) {
            console.error("Error fetching branch name:", error);
            return null;
        }
    };

    useEffect(() => {
        const fetchProfileDetails = async () => {
            setLoading(true);
            const token = getAuthToken();
            if (!token) {
                console.error("No authentication token found");
                setError("Authentication required");
                setLoading(false);
                return;
            }

            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);

            const requestOptions = {
                method: "GET",
                headers: myHeaders,
                redirect: "follow",
            };

            try {
                const response = await fetch(
                    `${API_BASE_URL || "http://localhost:5000"}/users/me`,
                    requestOptions
                );
                
                if (!response.ok) {
                    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
                }
                
                const result = await response.json();
                console.log("Profile data received:", result);
                
                // Extract the user data from the nested structure
                let userData = null;
                if (result.success && result.data && result.data.user) {
                    userData = result.data.user;
                } else if (result.success && result.data) {
                    userData = result.data;
                } else if (result.user) {
                    userData = result.user;
                } else {
                    userData = result;
                }
                
                console.log("Extracted user data:", userData);
                setProfileDetails(userData);
                
                // If branch_id exists, fetch the branch name
                if (userData && userData.branch_id) {
                    try {
                        const name = await fetchBranchName(userData.branch_id);
                        if (name) {
                            setBranchName(name);
                        } else {
                            // If we can't get the branch name, just display the ID for now
                            setBranchName(`Branch ID: ${userData.branch_id}`);
                        }
                    } catch (branchError) {
                        console.error("Error in branch name fetch:", branchError);
                        setBranchName(`Branch ID: ${userData.branch_id}`);
                    }
                } else if (userData && userData.branch) {
                    // Sometimes the branch might be directly available
                    if (typeof userData.branch === 'string') {
                        setBranchName(userData.branch);
                    } else if (userData.branch && userData.branch.branch_name) {
                        setBranchName(userData.branch.branch_name);
                    } else if (userData.branch && userData.branch.name) {
                        setBranchName(userData.branch.name);
                    }
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Error fetching profile details:", error);
                setError("Failed to load profile");
                setLoading(false);
            }
        };

        fetchProfileDetails();
    }, []);

    return (
        <div style={{ position: "relative" }}>
            <FaUser
                size={30}
                style={{ cursor: "pointer" }}
                onClick={toggleDropdown}
            />
            {showDropdown && (
                <div
                    style={{
                        position: "absolute",
                        top: "40px",
                        right: "0",
                        backgroundColor: "white",
                        border: "1px solid #ccc",
                        borderRadius: "5px",
                        padding: "10px",
                        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                        zIndex: 1000,
                        minWidth: "200px",
                    }}
                >
                    {loading && <p>Loading profile...</p>}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    {!loading && !error && profileDetails && (
                        <>
                            <p><strong>Name:</strong> {profileDetails.name || profileDetails.username || "N/A"}</p>
                            <p><strong>Email:</strong> {profileDetails.email || "N/A"}</p>
                            <p><strong>Role:</strong> {profileDetails.role || "N/A"}</p>
                            <p><strong>Phone:</strong> {profileDetails.phone_number || "N/A"}</p>
                            <p><strong>Page:</strong> {profileDetails.year || "N/A"}</p>
                            <p><strong>Branch:</strong> {branchName || "Not specified"}</p>
                            <p><strong>Joined At:</strong> {new Date(profileDetails.updatedAt || profileDetails.createdAt).toLocaleDateString() || "N/A"}</p>
                            {profileDetails.joinedDate && (
                                <p><strong>Joined Date:</strong> {profileDetails.joinedDate}</p>
                            )}
                            <button 
                                onClick={() => {
                                    localStorage.removeItem('token');
                                    window.location.href = '/login';
                                }}
                                style={{
                                    marginTop: "10px",
                                    padding: "5px 10px",
                                    backgroundColor: "#f44336",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Logout
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default TeacherProfile;