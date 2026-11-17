package com.example.studentcourseregistration.controller;

import com.example.studentcourseregistration.dto.CourseRequest;
import com.example.studentcourseregistration.dto.RegistrationRequest;
import com.example.studentcourseregistration.dto.RegistrationResponse;
import com.example.studentcourseregistration.dto.StudentRequest;
import com.example.studentcourseregistration.model.Course;
import com.example.studentcourseregistration.model.Registration;
import com.example.studentcourseregistration.model.Student;
import com.example.studentcourseregistration.service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class RegistrationController {
    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    @PostMapping("/students")
    @ResponseStatus(HttpStatus.CREATED)
    public Student createStudent(@Valid @RequestBody StudentRequest request) {
        return registrationService.createStudent(request);
    }

    @GetMapping("/students")
    public List<Student> getStudents() {
        return registrationService.getStudents();
    }

    @PostMapping("/courses")
    @ResponseStatus(HttpStatus.CREATED)
    public Course createCourse(@Valid @RequestBody CourseRequest request) {
        return registrationService.createCourse(request);
    }

    @GetMapping("/courses")
    public List<Course> getCourses() {
        return registrationService.getCourses();
    }

    @PostMapping("/registrations")
    @ResponseStatus(HttpStatus.CREATED)
    public RegistrationResponse registerStudent(@Valid @RequestBody RegistrationRequest request) {
        return registrationService.registerStudent(request);
    }

    @GetMapping("/registrations")
    public List<Registration> getRegistrations() {
        return registrationService.getRegistrations();
    }
}
