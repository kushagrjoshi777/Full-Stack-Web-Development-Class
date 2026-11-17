package com.example.studentcourseregistration.service;

import com.example.studentcourseregistration.dto.CourseRequest;
import com.example.studentcourseregistration.dto.RegistrationRequest;
import com.example.studentcourseregistration.dto.RegistrationResponse;
import com.example.studentcourseregistration.dto.StudentRequest;
import com.example.studentcourseregistration.model.Course;
import com.example.studentcourseregistration.model.Registration;
import com.example.studentcourseregistration.model.Student;
import com.example.studentcourseregistration.repository.CourseRepository;
import com.example.studentcourseregistration.repository.RegistrationRepository;
import com.example.studentcourseregistration.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;

@Service
public class RegistrationService {
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final RegistrationRepository registrationRepository;

    public RegistrationService(StudentRepository studentRepository,
                               CourseRepository courseRepository,
                               RegistrationRepository registrationRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.registrationRepository = registrationRepository;
    }

    @Transactional
    public Student createStudent(StudentRequest request) {
        if (studentRepository.existsByEmailIgnoreCase(request.email().trim())) {
            throw new IllegalStateException("A student with this email already exists");
        }
        return studentRepository.save(new Student(request.name().trim(), request.email().trim()));
    }

    @Transactional
    public Course createCourse(CourseRequest request) {
        if (request.capacity() < 1) {
            throw new IllegalArgumentException("Course capacity must be at least 1");
        }
        if (courseRepository.existsByCodeIgnoreCase(request.code().trim())) {
            throw new IllegalStateException("A course with this code already exists");
        }
        return courseRepository.save(new Course(request.code().trim(), request.title().trim(), request.capacity()));
    }

    public List<Student> getStudents() {
        return studentRepository.findAll();
    }

    public List<Course> getCourses() {
        return courseRepository.findAll();
    }

    public List<Registration> getRegistrations() {
        return registrationRepository.findAll();
    }

    @Transactional
    public RegistrationResponse registerStudent(RegistrationRequest request) {
        Student student = studentRepository.findById(request.studentId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found"));
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Course not found"));

        // Business rule 1: a student cannot register for the same course twice.
        if (registrationRepository.existsByStudentIdAndCourseId(student.getId(), course.getId())) {
            throw new IllegalStateException("Student is already registered for this course");
        }

        // Business rule 2: registration is rejected when the course is at capacity.
        if (course.getEnrolledCount() >= course.getCapacity()) {
            throw new IllegalStateException("Course is full");
        }

        Registration saved = registrationRepository.save(new Registration(student, course));
        course.setEnrolledCount(course.getEnrolledCount() + 1);
        courseRepository.save(course);
        return new RegistrationResponse(saved.getId(), student.getId(), course.getId(), course.getTitle());
    }
}
