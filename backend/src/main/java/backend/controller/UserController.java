package backend.controller;


import backend.exception.UserNotFoundException;

import backend.model.UserModel;

import backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;


@CrossOrigin(origins = "http://localhost:5173")  // Update this line
@RestController
//@RequestMapping("/user")
public class UserController {


    @Autowired
    private UserRepository userRepository;


    // Insert inventory item with image
    @PostMapping("/user")
    public UserModel newUserModel(@RequestBody UserModel newUserModel) {
        return userRepository.save(newUserModel);
    }


    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login (@RequestBody UserModel loginDetails){
        UserModel user = userRepository.findByEmail(loginDetails.getEmail())
                .orElseThrow(() -> new UserNotFoundException("Email not found : " + loginDetails.getEmail()));

        if (user.getPassword().equals(loginDetails.getPassword())){
            Map<String, Object> response = new HashMap<>();
            response.put("Message", "Login Successfull");
            response.put("id", user.getId());
            return ResponseEntity.ok(response);
        }else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("Message","Invalid"));
        }
    }


    @GetMapping("/user")
    List<UserModel> getallUsers() {
        return userRepository.findAll();
    }

    @GetMapping("/user/{id}")
    UserModel getUserId(@PathVariable Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));
    }

    @PutMapping("/user/{id}")
    public ResponseEntity<UserModel> updateUser(@PathVariable Long id, @RequestBody UserModel updatedUser) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        user.setFullname(updatedUser.getFullname());
        user.setEmail(updatedUser.getEmail());
        user.setPassword(updatedUser.getPassword());
        user.setPhone(updatedUser.getPhone());

        UserModel savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        UserModel user = userRepository.findById(id)
                .orElseThrow(() -> new UserNotFoundException(id));

        userRepository.delete(user);
        return ResponseEntity.ok("User with ID " + id + " deleted successfully.");
    }









}
