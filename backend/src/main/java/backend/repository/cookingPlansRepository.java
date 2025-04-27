package backend.repository;

import backend.model.cookingPlansModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface cookingPlansRepository extends JpaRepository<cookingPlansModel, Long> {
}
