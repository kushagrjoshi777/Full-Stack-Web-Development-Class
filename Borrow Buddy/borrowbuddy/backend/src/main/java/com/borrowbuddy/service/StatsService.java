package com.borrowbuddy.service;

import com.borrowbuddy.dto.Dtos;
import com.borrowbuddy.dto.Dtos.*;
import com.borrowbuddy.entity.*;
import com.borrowbuddy.exception.ApiException;
import com.borrowbuddy.repository.BorrowRequestRepository;
import com.borrowbuddy.repository.ItemRepository;
import com.borrowbuddy.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StatsService {
    private final UserRepository users;
    private final ItemRepository items;
    private final BorrowRequestRepository requests;
    private final AuthService auth;

    public StatsService(UserRepository users, ItemRepository items, BorrowRequestRepository requests, AuthService auth) {
        this.users = users;
        this.items = items;
        this.requests = requests;
        this.auth = auth;
    }

    @Transactional(readOnly = true)
    public PublicStats publicStats() {
        long free = items.findAllWithDetails().stream()
                .filter(i -> i.getDailyPrice() == null || i.getDailyPrice().compareTo(BigDecimal.ZERO) == 0).count();
        return new PublicStats(users.count(), items.count(), requests.countByStatus(RequestStatus.RETURNED), free);
    }

    @Transactional(readOnly = true)
    public DashboardStats dashboard() {
        Long uid = auth.currentUser().getId();
        long available = items.findByOwner(uid).stream().filter(i -> i.getStatus() == ItemStatus.AVAILABLE).count();
        return new DashboardStats(
                items.countByOwnerId(uid), available,
                requests.countIncomingByStatus(uid, RequestStatus.PENDING),
                requests.countOutgoingByStatus(uid, RequestStatus.PENDING),
                requests.countOutgoingByStatus(uid, RequestStatus.ACTIVE),
                requests.countIncomingByStatus(uid, RequestStatus.ACTIVE),
                requests.countOutgoingByStatus(uid, RequestStatus.RETURNED),
                requests.countIncomingByStatus(uid, RequestStatus.RETURNED));
    }

    @Transactional(readOnly = true)
    public AdminStats adminStats() {
        return new AdminStats(users.count(), items.count(), requests.count(),
                requests.countByStatus(RequestStatus.ACTIVE), requests.countByStatus(RequestStatus.PENDING),
                requests.countByStatus(RequestStatus.RETURNED), items.countByStatus(ItemStatus.UNAVAILABLE));
    }

    // ---- admin management ----
    @Transactional(readOnly = true)
    public List<UserDto> adminUsers() {
        return users.findAll().stream().map(Dtos::toDto).toList();
    }

    @Transactional
    public UserDto setEnabled(Long id, boolean enabled) {
        User me = auth.currentUser();
        User u = users.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (u.getId().equals(me.getId())) throw ApiException.badRequest("You cannot suspend your own account");
        u.setEnabled(enabled);
        return Dtos.toDto(u);
    }

    @Transactional
    public UserDto setRole(Long id, Role role) {
        User me = auth.currentUser();
        User u = users.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        if (u.getId().equals(me.getId())) throw ApiException.badRequest("You cannot change your own role");
        u.setRole(role);
        return Dtos.toDto(u);
    }

    @Transactional(readOnly = true)
    public List<ItemDto> adminItems() {
        return items.findAllWithDetails().stream().map(Dtos::toDto).toList();
    }

    @Transactional
    public void adminDeleteItem(Long id) {
        Item item = items.findById(id).orElseThrow(() -> ApiException.notFound("Item not found"));
        items.delete(item);
    }

    @Transactional
    public ItemDto adminSetItemStatus(Long id, ItemStatus status) {
        Item item = items.findById(id).orElseThrow(() -> ApiException.notFound("Item not found"));
        if (status == ItemStatus.BORROWED) throw ApiException.badRequest("BORROWED is set via handover only");
        if (item.getStatus() == ItemStatus.BORROWED) throw ApiException.conflict("Item is currently out on loan");
        item.setStatus(status);
        return Dtos.toDto(item);
    }

    @Transactional(readOnly = true)
    public List<BorrowRequestDto> adminRequests() {
        return requests.findAllWithDetails().stream().map(Dtos::toDto).toList();
    }
}
