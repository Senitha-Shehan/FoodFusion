import React, { useState } from "react";
import axios from "axios";

const AddCookingPlans = () => {
    const [cookingPlans, setCookingPlans] = useState({
        planName: "",
        planType: "",
        planDescription: "",
        planRecipes: "",
        planImage: null
    });

    const onInputChange = (e) => {
        if (e.target.name === "planImage") {
            setCookingPlans({ ...cookingPlans, planImage: e.target.files[0] });
        } else {
            setCookingPlans({ ...cookingPlans, [e.target.name]: e.target.value });
        }
    };

    const onSubmit = async (e) => {
        e.preventDefault(); // Prevents form reload

        const formData = new FormData();
        formData.append("file", cookingPlans.planImage);

        let imageName = "";

        try {
            const response = await axios.post("http://localhost:8080/cookingPlans/planImg", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            imageName = response.data.filename; // Use 'filename' from JSON response
        } catch (error) {
            console.error("Upload error:", error);
            alert("Error uploading image: " + (error.response?.data?.error || error.message));
            return;
        }

        const updatedCookingPlans = { ...cookingPlans, planImage: imageName };

        try {
            await axios.post("http://localhost:8080/cookingPlans", updatedCookingPlans);
            alert("Plan added successfully");
            window.location.reload();
        } catch (error) {
            alert("Error saving plan: " + error.message);
        }
    };

    return (
        <div style={formContainerStyle}>
            <div style={formWrapperStyle}>
                <h2 style={formTitleStyle}>Add Cooking Plan</h2>
                <form style={formStyle} onSubmit={onSubmit}>
                    <input
                        type="text"
                        name="planName"
                        placeholder="Plan Name"
                        style={inputStyle}
                        value={cookingPlans.planName}
                        onChange={onInputChange}
                        required
                    />
                    <input
                        type="text"
                        name="planType"
                        placeholder="Plan Type"
                        style={inputStyle}
                        value={cookingPlans.planType}
                        onChange={onInputChange}
                        required
                    />
                    <textarea
                        name="planDescription"
                        placeholder="Plan Description"
                        style={inputStyle}
                        value={cookingPlans.planDescription}
                        onChange={onInputChange}
                        required
                    />
                    <textarea
                        name="planRecipes"
                        placeholder="Plan Recipes"
                        style={inputStyle}
                        value={cookingPlans.planRecipes}
                        onChange={onInputChange}
                        required
                    />
                    <input
                        type="file"
                        accept="image/*"
                        name="planImage"
                        style={inputStyle}
                        onChange={onInputChange}
                    />
                    <button type="submit" style={buttonStyle}>Submit</button>
                </form>
            </div>
        </div>
    );
};

const formContainerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f7f7f7"
};

const formWrapperStyle = {
    maxWidth: "500px",
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

const formStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "15px"
};

const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "16px",
    outline: "none",
    boxSizing: "border-box", // Ensures padding and border are included in the width and height
    transition: "border-color 0.3s ease-in-out"
};

const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.3s ease-in-out"
};

export default AddCookingPlans;