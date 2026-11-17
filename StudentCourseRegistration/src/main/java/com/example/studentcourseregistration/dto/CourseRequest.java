package com.example.studentcourseregistration.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CourseRequest(
        @NotBlank(message = "Course code is required") String code,
        @NotBlank(message = "Course title is required") String title,
        @Min(value = 1, message = "Course capacity must be at least 1") int capacity
) { }
