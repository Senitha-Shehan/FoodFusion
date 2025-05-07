package backend.controller;

import backend.exception.UserNotFoundException;
import backend.model.UserFollow;
import backend.model.UserModel;

import backend.repository.UserRepository;
import backend.repository.UserFollowRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserFollowRepository userFollowRepository;




    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final String UPLOAD_DIR = "src/main/resources/static/uploads/profile-pictures/";

    @PostMapping("/user")
    public ResponseEntity<?> newUserModel(@RequestBody UserModel newUserModel) {
        try {
            // Check if email already exists
            Optional<UserModel> existingUser = userRepository.findByEmail(newUserModel.getEmail());
            if (existingUser.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Email already registered");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            // Hash the password before saving
            newUserModel.setPassword(passwordEncoder.encode(newUserModel.getPassword()));
            UserModel savedUser = userRepository.save(newUserModel);
            
            // Don't return the password in the response
            savedUser.setPassword(null);
            return ResponseEntity.ok(savedUser);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Error creating user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/user/{id}/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            UserModel user = userRepository.findById(id)
                    .orElseThrow(() -> new UserNotFoundException(id));

            // Create upload directory if it doesn't exist
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                System.out.println("Creating upload directory: " + UPLOAD_DIR);
                boolean created = uploadDir.mkdirs();
                if (!created) {
                    System.err.println("Failed to create upload directory: " + UPLOAD_DIR);
                    throw new IOException("Failed to create upload directory");
                }
            }

            // Validate file
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Please select a file to upload"));
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            if (originalFilename == null) {
                return ResponseEntity.badRequest()
                    .body(Map.of("message", "Invalid filename"));
            }

            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            Path filePath = Paths.get(UPLOAD_DIR + filename);

            System.out.println("Saving file to: " + filePath);

            // Save the file
            try {
                Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                System.err.println("Error saving file: " + e.getMessage());
                throw e;
            }

            // Update user's profile picture path
            String profilePicturePath = "/uploads/profile-pictures/" + filename;
            user.setProfilePicture(profilePicturePath);
            UserModel savedUser = userRepository.save(user);
            savedUser.setPassword(null); // Don't send password back to client

            return ResponseEntity.ok(Map.of(
                "message", "Profile picture uploaded successfully",
                "profilePicture", profilePicturePath,
                "user", savedUser
            ));
        } catch (UserNotFoundException e) {
            System.err.println("User not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (IOException e) {
            System.err.println("IO Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading profile picture: " + e.getMessage()));
        } catch (Exception e) {
            System.err.println("Unexpected error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error uploading profile picture: " + e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserModel loginDetails) {
        try {
            UserModel user = userRepository.findByEmail(loginDetails.getEmail())
                    .orElseThrow(() -> new UserNotFoundException("Email not found: " + loginDetails.getEmail()));

            if (passwordEncoder.matches(loginDetails.getPassword(), user.getPassword())) {
                Map<String, Object> response = new HashMap<>();
                response.put("message", "Login Successful");
                response.put("id", user.getId());
                response.put("email", user.getEmail());
                response.put("fullname", user.getFullname());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Invalid credentials"));
            }
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "An error occurred during login"));
        }
    }

    @GetMapping("/user")
    public ResponseEntity<List<UserModel>> getAllUsers() {
        try {
            List<UserModel> users = userRepository.findAll();
            users.forEach(user -> user.setPassword(null));
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            UserModel user = userRepository.findById(id)
                    .orElseThrow(() -> new UserNotFoundException(id));
            user.setPassword(null);
            return ResponseEntity.ok(user);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error retrieving user"));
        }
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserModel updatedUser) {
        try {
            UserModel user = userRepository.findById(id)
                    .orElseThrow(() -> new UserNotFoundException(id));

            // If updating email, check if new email already exists
            if (!user.getEmail().equals(updatedUser.getEmail())) {
                Optional<UserModel> existingUser = userRepository.findByEmail(updatedUser.getEmail());
                if (existingUser.isPresent()) {
                    return ResponseEntity.status(HttpStatus.CONFLICT)
                            .body(Map.of("message", "Email already registered"));
                }
            }

            user.setFullname(updatedUser.getFullname());
            user.setEmail(updatedUser.getEmail());
            user.setPhone(updatedUser.getPhone());
            
            // Only update password if provided
            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }

            UserModel savedUser = userRepository.save(user);
            savedUser.setPassword(null);
            return ResponseEntity.ok(savedUser);
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error updating user"));
        }
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            UserModel user = userRepository.findById(id)
                    .orElseThrow(() -> new UserNotFoundException(id));

            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error deleting user"));
        }
    }

    @GetMapping("/uploads/profile-pictures/{filename}")
    public ResponseEntity<org.springframework.core.io.Resource> getProfilePicture(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            org.springframework.core.io.Resource resource = new org.springframework.core.io.FileSystemResource(filePath.toFile());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.IMAGE_JPEG)
                    .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/user/{followerId}/follow/{followingId}")
    public ResponseEntity<?> followUser(@PathVariable Long followerId, @PathVariable Long followingId) {
        try {
            UserModel follower = userRepository.findById(followerId)
                    .orElseThrow(() -> new RuntimeException("Follower not found"));
            UserModel following = userRepository.findById(followingId)
                    .orElseThrow(() -> new RuntimeException("User to follow not found"));

            if (userFollowRepository.findByFollowerAndFollowing(follower, following).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Already following this user"));
            }

            UserFollow userFollow = new UserFollow(follower, following);
            userFollowRepository.save(userFollow);

            return ResponseEntity.ok(Map.of("message", "Successfully followed user"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/user/{followerId}/unfollow/{followingId}")
    public ResponseEntity<?> unfollowUser(
            @PathVariable Long followerId,
            @PathVariable Long followingId) {
        try {
            // Validate input parameters
            if (followerId == null || followingId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "Invalid user IDs provided"));
            }

            // Check if both users exist
            UserModel follower = userRepository.findById(followerId)
                    .orElseThrow(() -> new UserNotFoundException("Follower not found with ID: " + followerId));
            UserModel following = userRepository.findById(followingId)
                    .orElseThrow(() -> new UserNotFoundException("Following user not found with ID: " + followingId));

            // Check if the follow relationship exists
            Optional<UserFollow> existingFollow = userFollowRepository.findByFollowerAndFollowing(follower, following);
            if (!existingFollow.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("message", "You are not following this user"));
            }

            try {
                // Delete the follow relationship using the existing follow record
                userFollowRepository.delete(existingFollow.get());
                return ResponseEntity.ok(Map.of("message", "Successfully unfollowed user"));
            } catch (Exception e) {
                e.printStackTrace();
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(Map.of(
                            "message", "Failed to delete follow relationship",
                            "error", e.getMessage()
                        ));
            }
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                        "message", "An unexpected error occurred",
                        "error", e.getMessage()
                    ));
        }
    }

    @GetMapping("/user/{userId}/following")
    public ResponseEntity<?> getFollowing(@PathVariable Long userId) {
        try {
            List<UserModel> following = userFollowRepository.findFollowingByFollowerId(userId);
            following.forEach(user -> user.setPassword(null));
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error getting following list: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}/followers")
    public ResponseEntity<?> getFollowers(@PathVariable Long userId) {
        try {
            List<UserModel> followers = userFollowRepository.findFollowersByFollowingId(userId);
            followers.forEach(user -> user.setPassword(null));
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error getting followers list: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{userId}/is-following/{targetId}")
    public ResponseEntity<?> isFollowing(
            @PathVariable Long userId,
            @PathVariable Long targetId) {
        try {
            UserModel follower = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));
            UserModel following = userRepository.findById(targetId)
                    .orElseThrow(() -> new UserNotFoundException(targetId));

            boolean isFollowing = userFollowRepository.findByFollowerAndFollowing(follower, following).isPresent();
            return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
        } catch (UserNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error checking follow status: " + e.getMessage()));
        }
    }
}
