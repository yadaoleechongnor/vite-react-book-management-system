import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/api";

const GetbookBybranch = () => {
    const [branches, setBranches] = useState([]);
    const [activeMenu, setActiveMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No token found");
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

        setLoading(true);
        fetch(`${API_BASE_URL}/v1/books/getbookwithbranch`, requestOptions)
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then((result) => {
                if (result && result.success && result.data) {
                    // Format data to include branch name
                    const formattedBranches = result.data.map(item => {
                        // Extract branch ID
                        const branchId = item.branch._id;
                        
                        // Get branch name directly from the branch object
                        // In your API response, branch_name is directly available in item.branch
                        let branchName = "Unknown Branch";
                        
                        if (item.branch && item.branch.branch_name) {
                            // Branch name is directly available in the branch object
                            branchName = item.branch.branch_name;
                        }
                        
                        // Count the number of books in this branch
                        const bookCount = item.books ? item.books.length : 0;
                        
                        return {
                            _id: branchId,
                            branch_name: branchName,
                            bookCount: bookCount
                        };
                    });
                    
                    console.log("Formatted branches:", formattedBranches);
                    setBranches(formattedBranches);
                } else {
                    throw new Error("Invalid API response structure");
                }
            })
            .catch((error) => {
                console.error("Error fetching branches:", error);
                setError("Failed to load branches. Please try again later.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleMenuClick = (branchId) => {
        if (!branchId) {
            console.error("Invalid branch ID");
            return;
        }
        
        setActiveMenu(branchId);
        navigate(`/student/getbookwithbranch/${branchId}`);
        
        // Log navigation for debugging
        console.log(`Navigating to branch: ${branchId}`);
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">ສາຂາທີ່ມີປື້ມໃນລະບົບ</h1>
            
            {loading && <p className="text-gray-600">Loading branches...</p>}
            {error && <p className="text-red-500">{error}</p>}
            
            {!loading && !error && branches.length === 0 && (
                <p className="text-gray-600">No branches found. Please check back later.</p>
            )}
            
            {branches.length > 0 && (
                <ul className="space-y-2">
                    {branches.map((branch) => (
                        <li
                            key={branch._id}
                            onClick={() => handleMenuClick(branch._id)}
                            className={`
                                px-2 rounded-lg cursor-pointer transition-all border 
                                ${activeMenu === branch._id 
                                    ? "bg-sky-400 text-white " 
                                    : "bg-white text-black hover:bg-gray-100 border-gray-200"}
                            `}
                        >
                            <div className="font-medium">
                                {branch.branch_name }
                            </div>
                            <div className="text-sm text-gray-600">
                                ມີທັງໝົດ: {branch.bookCount || 0}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default GetbookBybranch;