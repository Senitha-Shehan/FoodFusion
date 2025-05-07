package backend.repository;

import backend.model.UserFollow;
import backend.model.UserModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, Long> {
    Optional<UserFollow> findByFollowerAndFollowing(UserModel follower, UserModel following);
    
    @Query("SELECT uf.following FROM UserFollow uf WHERE uf.follower.id = ?1")
    List<UserModel> findFollowingByFollowerId(Long followerId);
    
    @Query("SELECT uf.follower FROM UserFollow uf WHERE uf.following.id = ?1")
    List<UserModel> findFollowersByFollowingId(Long followingId);
    
    void deleteByFollowerAndFollowing(UserModel follower, UserModel following);
} 