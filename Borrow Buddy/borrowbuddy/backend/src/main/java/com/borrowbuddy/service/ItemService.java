package com.borrowbuddy.service;

import com.borrowbuddy.dto.Dtos;
import com.borrowbuddy.dto.Dtos.*;
import com.borrowbuddy.entity.*;
import com.borrowbuddy.exception.ApiException;
import com.borrowbuddy.repository.BorrowRequestRepository;
import com.borrowbuddy.repository.CategoryRepository;
import com.borrowbuddy.repository.ItemRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

@Service
public class ItemService {
    private final ItemRepository items;
    private final CategoryRepository categories;
    private final BorrowRequestRepository requests;
    private final AuthService auth;

    public ItemService(ItemRepository items, CategoryRepository categories, BorrowRequestRepository requests,
                       AuthService auth) {
        this.items = items;
        this.categories = categories;
        this.requests = requests;
        this.auth = auth;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> categories() {
        return categories.findAll().stream()
                .map(c -> new CategoryDto(c.getId(), c.getName(), c.getIcon(), c.getDescription(),
                        items.countByCategoryId(c.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ItemDto> search(String q, Long categoryId, String location, String priceType) {
        String mode = priceType == null ? "ALL" : priceType.trim().toUpperCase();
        if (!Set.of("ALL", "FREE", "PAID").contains(mode)) mode = "ALL";
        return items.search(q == null ? "" : q.trim(), categoryId, location == null ? "" : location.trim(), mode)
                .stream().map(Dtos::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ItemDto> featured() {
        return items.findFeatured(PageRequest.of(0, 8)).stream().map(Dtos::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<String> locations() {
        return items.findDistinctLocations();
    }

    @Transactional(readOnly = true)
    public ItemDto get(Long id) {
        return Dtos.toDto(find(id));
    }

    @Transactional(readOnly = true)
    public List<ItemDto> mine() {
        return items.findByOwner(auth.currentUser().getId()).stream().map(Dtos::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingRange> bookings(Long itemId) {
        find(itemId);
        return requests.findByItemAndStatuses(itemId, List.of(RequestStatus.APPROVED, RequestStatus.ACTIVE)).stream()
                .map(r -> new BookingRange(r.getStartDate(), r.getEndDate(), r.getStatus())).toList();
    }

    @Transactional
    public ItemDto create(ItemRequest req) {
        User owner = auth.currentUser();
        Item item = new Item();
        item.setOwner(owner);
        apply(item, req, false);
        return Dtos.toDto(items.save(item));
    }

    @Transactional
    public ItemDto update(Long id, ItemRequest req) {
        Item item = find(id);
        requireOwner(item);
        apply(item, req, true);
        return Dtos.toDto(items.save(item));
    }

    @Transactional
    public void delete(Long id) {
        Item item = find(id);
        requireOwner(item);
        if (requests.existsByItemIdAndStatus(id, RequestStatus.ACTIVE)
                || requests.existsByItemIdAndStatus(id, RequestStatus.APPROVED)) {
            throw ApiException.conflict("This item has approved or active bookings. Resolve them before deleting.");
        }
        items.delete(item);
    }

    private void requireOwner(Item item) {
        User u = auth.currentUser();
        if (!item.getOwner().getId().equals(u.getId())) {
            throw ApiException.forbidden("You can only modify your own listings");
        }
    }

    private Item find(Long id) {
        return items.findById(id).orElseThrow(() -> ApiException.notFound("Item not found"));
    }

    private void apply(Item item, ItemRequest req, boolean updating) {
        Category cat = categories.findById(req.categoryId())
                .orElseThrow(() -> ApiException.badRequest("Unknown category"));
        item.setTitle(req.title().trim());
        item.setDescription(req.description().trim());
        item.setCategory(cat);
        item.setCondition(req.condition());
        item.setLocation(req.location().trim());
        item.setDailyPrice(req.dailyPrice() == null ? BigDecimal.ZERO : req.dailyPrice());
        item.setImageUrl(req.imageUrl() == null || req.imageUrl().isBlank() ? null : req.imageUrl().trim());
        if (req.status() != null) {
            if (updating && req.status() != item.getStatus()) {
                // BORROWED is controlled solely by handover/return transitions
                if (req.status() == ItemStatus.BORROWED || item.getStatus() == ItemStatus.BORROWED) {
                    throw ApiException.conflict("Borrowed status is managed by handover and return actions");
                }
            }
            if (!updating && req.status() == ItemStatus.BORROWED) {
                throw ApiException.badRequest("New listings cannot start as BORROWED");
            }
            item.setStatus(req.status());
        }
    }
}
