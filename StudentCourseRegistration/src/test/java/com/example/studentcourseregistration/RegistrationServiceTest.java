package com.example.studentcourseregistration;

import com.example.studentcourseregistration.service.RegistrationService;

import com.example.studentcourseregistration.dto.RegistrationRequest;
import com.example.studentcourseregistration.model.Course;
import com.example.studentcourseregistration.model.Student;
import com.example.studentcourseregistration.repository.CourseRepository;
import com.example.studentcourseregistration.repository.RegistrationRepository;
import com.example.studentcourseregistration.repository.StudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RegistrationServiceTest {
    @Mock private StudentRepository studentRepository;
    @Mock private CourseRepository courseRepository;
    @Mock private RegistrationRepository registrationRepository;
    @InjectMocks private RegistrationService registrationService;

    private Student student;
    private Course fullCourse;

    @BeforeEach
    void setUp() {
        student = mock(Student.class);
        when(student.getId()).thenReturn(1L);
        fullCourse = mock(Course.class);
        when(fullCourse.getId()).thenReturn(10L);
        when(fullCourse.getCapacity()).thenReturn(1);
        when(fullCourse.getEnrolledCount()).thenReturn(1);
    }

    @Test
    void rejectsRegistrationWhenCourseIsFull() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(fullCourse));
        when(registrationRepository.existsByStudentIdAndCourseId(1L, 10L)).thenReturn(false);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> registrationService.registerStudent(new RegistrationRequest(1L, 10L)));

        assertEquals("Course is full", exception.getMessage());
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void rejectsDuplicateRegistration() {
        when(studentRepository.findById(1L)).thenReturn(Optional.of(student));
        when(courseRepository.findById(10L)).thenReturn(Optional.of(fullCourse));
        when(registrationRepository.existsByStudentIdAndCourseId(1L, 10L)).thenReturn(true);

        IllegalStateException exception = assertThrows(IllegalStateException.class,
                () -> registrationService.registerStudent(new RegistrationRequest(1L, 10L)));

        assertEquals("Student is already registered for this course", exception.getMessage());
        verify(registrationRepository, never()).save(any());
    }

    @Test
    void returnsNotFoundWhenStudentDoesNotExist() {
        when(studentRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class,
                () -> registrationService.registerStudent(new RegistrationRequest(99L, 10L)));
        verify(registrationRepository, never()).save(any());
    }
}
