package backend.repository;

import backend.model.RecipeManagementModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecipeManagementRepository extends JpaRepository<RecipeManagementModel, Long> {
    // You can add custom query methods here if needed, for example:
    // List<RecipeManagementModel> findByTitleContaining(String title);
}
