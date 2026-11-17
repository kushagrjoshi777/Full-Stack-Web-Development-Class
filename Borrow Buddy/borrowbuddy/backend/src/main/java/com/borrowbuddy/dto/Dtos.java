package com.borrowbuddy.dto;

import com.borrowbuddy.entity.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

/** All request/response DTOs. Entities are never serialized directly. */
public final class Dtos {
    private Dtos() {}

    // ---------- Auth / users ----------
    public record RegisterRequest(
            @NotBlank @Size(max = 100) String name,
            @NotBlank @Email @Size(max = 150) String email,
            @NotBlank @Size(min = 6, max = 72, message = "Password must be 6-72 characters") String password,
            @Size(max = 20) String phone,
            @Size(max = 120) String location) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record AuthResponse(String token, UserDto user) {}

    public record UserDto(Long id, String name, String email, Role role, String phone, String location,
                          String bio, boolean enabled, LocalDateTime createdAt) {}

    public record PublicUserDto(Long id, String name, String location, String bio, LocalDateTime memberSince) {}

    public record UpdateProfileRequest(
            @NotBlank @Size(max = 100) String name,
            @Size(max = 20) String phone,
            @Size(max = 120) String location,
            @Size(max = 500) String bio) {}

    // ---------- Categories ----------
    public record CategoryDto(Long id, String name, String icon, String description, long itemCount) {}

    // ---------- Items ----------
    public record ItemRequest(
            @NotBlank @Size(max = 150) String title,
            @NotBlank @Size(max = 4000) String description,
            @NotNull Long categoryId,
            @NotNull ItemCondition condition,
            @NotBlank @Size(max = 120) String location,
            @DecimalMin(value = "0.0") @DecimalMax(value = "100000.0") BigDecimal dailyPrice,
            @Size(max = 500) String imageUrl,
            ItemStatus status) {}

    public record ItemDto(Long id, String title, String description, Long categoryId, String categoryName,
                          String categoryIcon, Long ownerId, String ownerName, String ownerLocation,
                          LocalDateTime ownerSince, ItemCondition condition, String location,
                          BigDecimal dailyPrice, boolean free, String imageUrl, ItemStatus status,
                          LocalDateTime createdAt) {}

    public record BookingRange(LocalDate startDate, LocalDate endDate, RequestStatus status) {}

    // ---------- Borrow requests ----------
    public record BorrowRequestCreate(
            @NotNull Long itemId,
            @NotNull @FutureOrPresent LocalDate startDate,
            @NotNull @FutureOrPresent LocalDate endDate,
            @Size(max = 500) String message) {}

    public record BorrowRequestDto(Long id, Long itemId, String itemTitle, String itemImageUrl,
                                   String itemLocation, String categoryName, Long ownerId, String ownerName,
                                   Long borrowerId, String borrowerName, LocalDate startDate, LocalDate endDate,
                                   String message, RequestStatus status, long days, BigDecimal totalPrice,
                                   LocalDateTime createdAt, LocalDateTime updatedAt) {}

    // ---------- Stats ----------
    public record PublicStats(long members, long items, long completedBorrows, long freeItems) {}

    public record DashboardStats(long listings, long availableListings, long incomingPending,
                                 long outgoingPending, long currentlyBorrowed, long currentlyLent,
                                 long completedBorrows, long completedLends) {}

    public record AdminStats(long users, long items, long requests, long activeBorrowings,
                             long pendingRequests, long completedRequests, long unavailableItems) {}

    // ---------- Mapping ----------
    public static UserDto toDto(User u) {
        return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getPhone(), u.getLocation(),
                u.getBio(), u.isEnabled(), u.getCreatedAt());
    }

    public static ItemDto toDto(Item i) {
        BigDecimal price = i.getDailyPrice() == null ? BigDecimal.ZERO : i.getDailyPrice();
        return new ItemDto(i.getId(), i.getTitle(), i.getDescription(), i.getCategory().getId(),
                i.getCategory().getName(), i.getCategory().getIcon(), i.getOwner().getId(),
                i.getOwner().getName(), i.getOwner().getLocation(), i.getOwner().getCreatedAt(),
                i.getCondition(), i.getLocation(), price, price.signum() == 0, i.getImageUrl(),
                i.getStatus(), i.getCreatedAt());
    }

    public static BorrowRequestDto toDto(BorrowRequest r) {
        Item i = r.getItem();
        long days = ChronoUnit.DAYS.between(r.getStartDate(), r.getEndDate()) + 1;
        BigDecimal price = i.getDailyPrice() == null ? BigDecimal.ZERO : i.getDailyPrice();
        return new BorrowRequestDto(r.getId(), i.getId(), i.getTitle(), i.getImageUrl(), i.getLocation(),
                i.getCategory().getName(), i.getOwner().getId(), i.getOwner().getName(),
                r.getBorrower().getId(), r.getBorrower().getName(), r.getStartDate(), r.getEndDate(),
                r.getMessage(), r.getStatus(), days, price.multiply(BigDecimal.valueOf(days)),
                r.getCreatedAt(), r.getUpdatedAt());
    }
}
