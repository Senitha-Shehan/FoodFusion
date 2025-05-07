package backend.model;

import jakarta.persistence.*;

@Entity
public class UserFollow {
    @Id
    @GeneratedValue
    private Long id;

    @ManyToOne
    @JoinColumn(name = "follower_id")
    private UserModel follower;

    @ManyToOne
    @JoinColumn(name = "following_id")
    private UserModel following;

    public UserFollow() {
    }

    public UserFollow(UserModel follower, UserModel following) {
        this.follower = follower;
        this.following = following;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserModel getFollower() {
        return follower;
    }

    public void setFollower(UserModel follower) {
        this.follower = follower;
    }

    public UserModel getFollowing() {
        return following;
    }

    public void setFollowing(UserModel following) {
        this.following = following;
    }
} 