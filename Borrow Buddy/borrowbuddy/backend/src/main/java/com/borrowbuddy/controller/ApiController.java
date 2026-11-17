package com.borrowbuddy.controller;

import com.borrowbuddy.dto.Dtos;
import com.borrowbuddy.dto.Dtos.*;
import com.borrowbuddy.service.AuthService;
import com.borrowbuddy.service.BorrowService;
import com.borrowbuddy.service.FileStorageService;
import com.borrowbuddy.service.ItemService;
import com.borrowbuddy.service.StatsService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ApiController {
    private final AuthService auth;
    private final ItemService items;
    private final BorrowService borrow;
    private final StatsService stats;
    private final FileStorageService storage;

    public ApiController(AuthService auth, ItemService items, BorrowService borrow, StatsService stats,
                         FileStorageService storage) {
        this.auth = auth;
        this.items = items;
        this.borrow = borrow;
        this.stats = stats;
        this.storage = storage;
    }

    // ---------- Auth & profile ----------
    @PostMapping("/auth/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(auth.register(req));
    }

    @PostMapping("/auth/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return auth.login(req);
    }

    @GetMapping("/auth/me")
    public UserDto me() {
        return Dtos.toDto(auth.currentUser());
    }

    @PutMapping("/users/me")
    public UserDto updateProfile(@Valid @RequestBody UpdateProfileRequest req) {
        return auth.updateProfile(req);
    }

    // ---------- Catalogue ----------
    @GetMapping("/categories")
    public List<CategoryDto> categories() {
        return items.categories();
    }

    @GetMapping("/stats/public")
    public PublicStats publicStats() {
        return stats.publicStats();
    }

    @GetMapping("/items")
    public List<ItemDto> search(@RequestParam(required = false) String q,
                                @RequestParam(required = false) Long categoryId,
                                @RequestParam(required = false) String location,
                                @RequestParam(required = false) String priceType) {
        return items.search(q, categoryId, location, priceType);
    }

    @GetMapping("/items/featured")
    public List<ItemDto> featured() {
        return items.featured();
    }

    @GetMapping("/items/locations")
    public List<String> locations() {
        return items.locations();
    }

    @GetMapping("/items/{id}")
    public ItemDto item(@PathVariable Long id) {
        return items.get(id);
    }

    @GetMapping("/items/{id}/bookings")
    public List<BookingRange> bookings(@PathVariable Long id) {
        return items.bookings(id);
    }

    // ---------- My listings ----------
    @GetMapping("/my/items")
    public List<ItemDto> myItems() {
        return items.mine();
    }

    @PostMapping("/items")
    public ResponseEntity<ItemDto> create(@Valid @RequestBody ItemRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(items.create(req));
    }

    @PutMapping("/items/{id}")
    public ItemDto update(@PathVariable Long id, @Valid @RequestBody ItemRequest req) {
        return items.update(id, req);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        items.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/uploads", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> upload(@RequestParam("file") MultipartFile file) {
        auth.currentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("url", storage.store(file)));
    }

    // ---------- Borrow requests ----------
    @PostMapping("/requests")
    public ResponseEntity<BorrowRequestDto> request(@Valid @RequestBody BorrowRequestCreate req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(borrow.create(req));
    }

    @GetMapping("/requests/incoming")
    public List<BorrowRequestDto> incoming() {
        return borrow.incoming();
    }

    @GetMapping("/requests/outgoing")
    public List<BorrowRequestDto> outgoing() {
        return borrow.outgoing();
    }

    @PatchMapping("/requests/{id}/approve")
    public BorrowRequestDto approve(@PathVariable Long id) { return borrow.approve(id); }

    @PatchMapping("/requests/{id}/reject")
    public BorrowRequestDto reject(@PathVariable Long id) { return borrow.reject(id); }

    @PatchMapping("/requests/{id}/handover")
    public BorrowRequestDto handover(@PathVariable Long id) { return borrow.handover(id); }

    @PatchMapping("/requests/{id}/return")
    public BorrowRequestDto returned(@PathVariable Long id) { return borrow.markReturned(id); }

    @PatchMapping("/requests/{id}/cancel")
    public BorrowRequestDto cancel(@PathVariable Long id) { return borrow.cancel(id); }

    // ---------- Dashboard ----------
    @GetMapping("/dashboard/stats")
    public DashboardStats dashboard() {
        return stats.dashboard();
    }

    // ---------- Admin ----------
    @GetMapping("/admin/stats")
    public AdminStats adminStats() { return stats.adminStats(); }

    @GetMapping("/admin/users")
    public List<UserDto> adminUsers() { return stats.adminUsers(); }

    @PatchMapping("/admin/users/{id}/enabled")
    public UserDto setEnabled(@PathVariable Long id, @RequestBody Map<String, Boolean> body) {
        Boolean enabled = body.get("enabled");
        if (enabled == null) throw com.borrowbuddy.exception.ApiException.badRequest("'enabled' is required");
        return stats.setEnabled(id, enabled);
    }

    @PatchMapping("/admin/users/{id}/role")
    public UserDto setRole(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return stats.setRole(id, com.borrowbuddy.entity.Role.valueOf(String.valueOf(body.get("role"))));
        } catch (IllegalArgumentException e) {
            throw com.borrowbuddy.exception.ApiException.badRequest("Role must be USER or ADMIN");
        }
    }

    @GetMapping("/admin/items")
    public List<ItemDto> adminItems() { return stats.adminItems(); }

    @PatchMapping("/admin/items/{id}/status")
    public ItemDto adminItemStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        try {
            return stats.adminSetItemStatus(id, com.borrowbuddy.entity.ItemStatus.valueOf(String.valueOf(body.get("status"))));
        } catch (IllegalArgumentException e) {
            throw com.borrowbuddy.exception.ApiException.badRequest("Invalid status");
        }
    }

    @DeleteMapping("/admin/items/{id}")
    public ResponseEntity<Void> adminDeleteItem(@PathVariable Long id) {
        stats.adminDeleteItem(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/admin/requests")
    public List<BorrowRequestDto> adminRequests() { return stats.adminRequests(); }

    @PatchMapping("/admin/requests/{id}/cancel")
    public BorrowRequestDto adminCancel(@PathVariable Long id) { return borrow.adminCancel(id); }
}
