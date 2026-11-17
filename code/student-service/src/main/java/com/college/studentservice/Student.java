package com.college.studentservice;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record Student(
        Long id,
        @NotBlank String name,
        @NotBlank @Email String email,
        @NotBlank String course,
        @Min(1) int year) {
}
