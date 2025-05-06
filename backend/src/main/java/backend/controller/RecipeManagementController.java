package backend.controller;

import backend.exception.RecipeNotFoundException;
import backend.model.RecipeManagementModel;
import backend.repository.RecipeManagementRepository;
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
@RequestMapping("/recipes")
public class RecipeManagementController {

    @Autowired
    private RecipeManagementRepository recipeManagementRepository;

    // Create a new recipe
    @PostMapping
    public RecipeManagementModel newRecipe(@RequestBody RecipeManagementModel newRecipe) {
        return recipeManagementRepository.save(newRecipe);
    }

    // Upload recipe image(s)
    @PostMapping("/uploadImages")
    public String uploadImages(@RequestParam("file") MultipartFile file) {
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

    // Get all recipes
    @GetMapping
    public List<RecipeManagementModel> getAllRecipes() {
        return recipeManagementRepository.findAll();
    }

    // Get a single recipe by ID
    @GetMapping("/{id}")
    public RecipeManagementModel getRecipeById(@PathVariable Long id) {
        return recipeManagementRepository.findById(id).orElseThrow(() -> new RecipeNotFoundException(id));
    }

    // Serve uploaded image(s)
    private final String UPLOAD_DIR = "src/main/resources/static/uploads/"; // Corrected path for serving files
    @GetMapping("/uploads/{filename}")
    public ResponseEntity<FileSystemResource> getImage(@PathVariable String filename) {
        File file = new File(UPLOAD_DIR + filename); // Serving the file from static folder
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(new FileSystemResource(file));
    }

    // Delete a recipe
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecipe(@PathVariable Long id) {
        if (recipeManagementRepository.existsById(id)) {
            recipeManagementRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    // Update a recipe
    @PutMapping("/{id}")
    public ResponseEntity<RecipeManagementModel> updateRecipe(@PathVariable Long id, @RequestBody RecipeManagementModel updatedRecipe) {
        return recipeManagementRepository.findById(id)
                .map(recipe -> {
                    recipe.setTitle(updatedRecipe.getTitle());
                    recipe.setDescription(updatedRecipe.getDescription());
                    recipe.setIngredients(updatedRecipe.getIngredients());
                    recipe.setSteps(updatedRecipe.getSteps());
                    recipe.setImages(updatedRecipe.getImages());
                    recipe.setVideo(updatedRecipe.getVideo());
                    return ResponseEntity.ok(recipeManagementRepository.save(recipe));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
