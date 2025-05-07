import React, { useState, useEffect } from "react";
import axios from "axios";

const DisplayCookingPlans = () => {
    const [plans, setPlans] = useState([]);
    const [editPlan, setEditPlan] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newImage, setNewImage] = useState(null);

    useEffect(() => {
        fetchPlans();
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await axios.get("http://localhost:8080/cookingPlans/cookingPlans");
            setPlans(response.data);
        } catch (error) {
            console.error("Error fetching cooking plans:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this cooking plan?")) {
            try {
                await axios.delete(`http://localhost:8080/cookingPlans/${id}`);
                setPlans((prev) => prev.filter(p => p.planId !== id));
            } catch (error) {
                console.error("Error deleting cooking plan:", error);
            }
        }
    };

    const openEditModal = (plan) => {
        setEditPlan({
            ...plan,
            planImageUrl: plan.planImage ? `http://localhost:8080/cookingPlans/uploads/${plan.planImage}` : null
        });
        setNewImage(null);
        setShowModal(true);
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = (event) => {
                setEditPlan({
                    ...editPlan, 
                    planImageUrl: event.target.result,
                });
            };
            reader.readAsDataURL(file);
            setNewImage(file);
        }
    };

    const handleUpdate = async () => {
        try {
            if (newImage) {
                const imageFormData = new FormData();
                imageFormData.append("file", newImage);
            
                const imgRes = await axios.put(
                    `http://localhost:8080/cookingPlans/${editPlan.planId}/image`, 
                    imageFormData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
            
                const uploadedFilename = imgRes.data.filename;
                editPlan.planImage = uploadedFilename;
            }
    
            const response = await axios.put(
                `http://localhost:8080/cookingPlans/${editPlan.planId}`, 
                {
                    planName: editPlan.planName,
                    planType: editPlan.planType,
                    planDescription: editPlan.planDescription,
                    planRecipes: editPlan.planRecipes,
                    planImage: editPlan.planImage
                },
                {
                    headers: {
                        "Content-Type": "application/json"
                    }
                }
            );
    
            setShowModal(false);
            fetchPlans();
        } catch (error) {
            console.error("Error updating cooking plan:", error);
            alert("Error updating plan: " + (error.response?.data?.message || error.message));
        }
    };
    

    const handleEditChange = (e) => {
        const { name, value } = e.target;
        setEditPlan({ ...editPlan, [name]: value });
    };

    return (
        <div style={formContainerStyle}>
            <div style={formWrapperStyle}>
                <h2 style={formTitleStyle}>Cooking Plans</h2>
                <div style={tableWrapperStyle}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={headerStyle}>Plan Name</th>
                                <th style={headerStyle}>Type</th>
                                <th style={headerStyle}>Description</th>
                                <th style={headerStyle}>Recipes</th>
                                <th style={headerStyle}>Image</th>
                                <th style={headerStyle}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {plans.map((plan) => (
                                <tr key={plan.planId}>
                                    <td>{plan.planName}</td>
                                    <td>{plan.planType}</td>
                                    <td>{plan.planDescription}</td>
                                    <td>{plan.planRecipes}</td>
                                    <td>
                                        {plan.planImage && (
                                            <img
                                                src={`http://localhost:8080/cookingPlans/uploads/${plan.planImage}`}
                                                alt="Plan"
                                                style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                            />
                                        )}
                                    </td>
                                    <td>
                                        <button 
                                            onClick={() => openEditModal(plan)} 
                                            style={editButtonStyle}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(plan.planId)} 
                                            style={deleteButtonStyle}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && editPlan && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h2>Edit Cooking Plan</h2>
                        
                        {editPlan.planImageUrl && (
                            <div style={{ marginBottom: "10px", textAlign: "center" }}>
                                <img 
                                    src={editPlan.planImageUrl} 
                                    alt="Current Plan" 
                                    style={{ maxWidth: "100%", maxHeight: "200px", borderRadius: "4px" }}
                                />
                            </div>
                        )}
                        
                        <div style={{ marginBottom: "10px" }}>
                            <label style={{ display: "block", marginBottom: "5px" }}>Change Image:</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ width: "100%" }}
                            />
                        </div>
                        
                        <div style={{ marginBottom: "10px" }}>
                            <label style={{ display: "block", marginBottom: "5px" }}>Plan Name:</label>
                            <input 
                                type="text" 
                                name="planName" 
                                value={editPlan.planName} 
                                onChange={handleEditChange} 
                                style={{ width: "100%", padding: "8px" }} 
                            />
                        </div>
                        
                        <div style={{ marginBottom: "10px" }}>
                            <label style={{ display: "block", marginBottom: "5px" }}>Plan Type:</label>
                            <input 
                                type="text" 
                                name="planType" 
                                value={editPlan.planType} 
                                onChange={handleEditChange} 
                                style={{ width: "100%", padding: "8px" }} 
                            />
                        </div>
                        
                        <div style={{ marginBottom: "10px" }}>
                            <label style={{ display: "block", marginBottom: "5px" }}>Description:</label>
                            <textarea 
                                name="planDescription" 
                                value={editPlan.planDescription} 
                                onChange={handleEditChange} 
                                style={{ width: "100%", padding: "8px", minHeight: "80px" }} 
                            />
                        </div>
                        
                        <div style={{ marginBottom: "10px" }}>
                            <label style={{ display: "block", marginBottom: "5px" }}>Recipes:</label>
                            <textarea 
                                name="planRecipes" 
                                value={editPlan.planRecipes} 
                                onChange={handleEditChange} 
                                style={{ width: "100%", padding: "8px", minHeight: "80px" }} 
                            />
                        </div>
                        
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                            <button 
                                onClick={() => setShowModal(false)} 
                                style={cancelButtonStyle}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleUpdate} 
                                style={saveButtonStyle}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Styles (same as before)
const formContainerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7"
};

const formWrapperStyle = {
    maxWidth: "1000px",
    width: "100%",
    padding: "24px",
    backgroundColor: "#fff",
    boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
    borderRadius: "10px",
    border: "1px solid #ddd"
};

const formTitleStyle = {
    fontSize: "24px",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: "20px",
    color: "#333"
};

const tableWrapperStyle = {
    overflowX: "auto",
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
};

const headerStyle = {
    padding: "12px",
    borderBottom: "2px solid #ddd",
    backgroundColor: "#f4f4f4",
};

const editButtonStyle = {
    marginRight: "8px",
    padding: "6px 12px",
    backgroundColor: "#008CBA",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
};

const deleteButtonStyle = {
    padding: "6px 12px",
    backgroundColor: "#FF4136",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
};

const modalOverlayStyle = {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
};

const modalContentStyle = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "400px",
    maxHeight: "90vh",
    overflowY: "auto"
};

const cancelButtonStyle = {
    marginRight: "8px",
    padding: "8px 16px",
    backgroundColor: "#777",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
};

const saveButtonStyle = {
    padding: "8px 16px",
    backgroundColor: "#28A745",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
};

export default DisplayCookingPlans;
