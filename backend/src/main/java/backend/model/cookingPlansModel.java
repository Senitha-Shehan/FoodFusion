package backend.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class cookingPlansModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long planId;
    private String planName;
    private String planType;
    private String planDescription;
    private String planRecipes;
    private String planImage;

    public cookingPlansModel() {}

    public cookingPlansModel(Long planId, String planName, String planType, String planDescription, String planRecipes, String planImage) {
        this.planId = planId;
        this.planName = planName;
        this.planType = planType;
        this.planDescription = planDescription;
        this.planRecipes = planRecipes;
        this.planImage = planImage;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public String getPlanName() {
        return planName;
    }

    public void setPlanName(String planName) {
        this.planName = planName;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public String getPlanDescription() {
        return planDescription;
    }

    public void setPlanDescription(String planDescription) {
        this.planDescription = planDescription;
    }

    public String getPlanRecipes() {
        return planRecipes;
    }

    public void setPlanRecipes(String planRecipes) {
        this.planRecipes = planRecipes;
    }

    public String getPlanImage() {
        return planImage;
    }

    public void setPlanImage(String planImage) {
        this.planImage = planImage;
    }
}
