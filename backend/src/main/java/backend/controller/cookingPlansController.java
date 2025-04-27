package backend.controller;

import backend.exception.cookingPlanNotFoundException;
import backend.model.cookingPlansModel;
import backend.repository.cookingPlansRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@CrossOrigin(origins = "*") // Allows requests from all origins
@RequestMapping("/cookingPlans")
public class cookingPlansController {

    @Autowired
    private cookingPlansRepository cookingPlansRepository;

    @PostMapping
    public cookingPlansModel newCookingPlansModel(@RequestBody cookingPlansModel newCookingPlansModel) {
        return cookingPlansRepository.save(newCookingPlansModel);
    }

    @PostMapping("/planImg")
    public String planImage(@RequestParam("file") MultipartFile file) {
        String folder = "src/main/resources/static/uploads/"; // Updated to static folder
        String fileName = file.getOriginalFilename();
        File uploadDir = new File(folder);

        if (!uploadDir.exists()) {
            uploadDir.mkdirs(); // Creates directory if it doesn't exist
        }

        try {
            Path filePath = Paths.get(folder + fileName);
            file.transferTo(filePath);
            return "{\"filename\": \"" + fileName + "\"}"; // JSON response
        } catch (IOException e) {
            e.printStackTrace();
            return "{\"error\": \"Error uploading file\"}";
        }
    }

    @GetMapping("/cookingPlans")
    public List<cookingPlansModel> getAllItems() {
        return cookingPlansRepository.findAll();
    }

    @GetMapping("/cookingPlans/{id}")
    public cookingPlansModel getItemId(@PathVariable Long id) {
        return cookingPlansRepository.findById(id).orElseThrow(() -> new cookingPlanNotFoundException(id));
    }

    private final String UPLOAD_DIR = "src/main/resources/static/uploads/"; // Corrected path for serving files
    @GetMapping("/uploads/{filename}")
    public ResponseEntity<FileSystemResource> getImage(@PathVariable String filename) {
        File file = new File(UPLOAD_DIR + filename); // Serving the file from static folder
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new FileSystemResource(file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCookingPlan(@PathVariable Long id) {
        if (cookingPlansRepository.existsById(id)) {
            cookingPlansRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<cookingPlansModel> updateCookingPlan(@PathVariable Long id, @RequestBody cookingPlansModel updatedPlan) {
        return cookingPlansRepository.findById(id)
                .map(plan -> {
                    plan.setPlanName(updatedPlan.getPlanName());
                    plan.setPlanType(updatedPlan.getPlanType());
                    plan.setPlanDescription(updatedPlan.getPlanDescription());
                    plan.setPlanRecipes(updatedPlan.getPlanRecipes());
                    plan.setPlanImage(updatedPlan.getPlanImage());
                    return ResponseEntity.ok(cookingPlansRepository.save(plan));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
