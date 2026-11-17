package com.borrowbuddy.service;

import com.borrowbuddy.dto.Dtos;
import com.borrowbuddy.dto.Dtos.*;
import com.borrowbuddy.entity.*;
import com.borrowbuddy.exception.ApiException;
import com.borrowbuddy.repository.BorrowRequestRepository;
import com.borrowbuddy.repository.ItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BorrowService {
    private static final List<RequestStatus> BLOCKING = List.of(RequestStatus.APPROVED, RequestStatus.ACTIVE);

    private final BorrowRequestRepository requests;
    private final ItemRepository items;
    private final AuthService auth;

    public BorrowService(BorrowRequestRepository requests, ItemRepository items, AuthService auth) {
        this.requests = requests;
        this.items = items;
        this.auth = auth;
    }

    @Transactional(readOnly = true)
    public List<BorrowRequestDto> incoming() {
        return requests.findIncoming(auth.currentUser().getId()).stream().map(Dtos::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowRequestDto> outgoing() {
        return requests.findOutgoing(auth.currentUser().getId()).stream().map(Dtos::toDto).toList();
    }

    @Transactional
    public BorrowRequestDto create(BorrowRequestCreate req) {
        User borrower = auth.currentUser();
        Item item = items.findById(req.itemId()).orElseThrow(() -> ApiException.notFound("Item not found"));
        if (item.getOwner().getId().equals(borrower.getId())) {
            throw ApiException.forbidden("You cannot borrow your own item");
        }
        if (item.getStatus() == ItemStatus.UNAVAILABLE) {
            throw ApiException.conflict("This item is currently not available for borrowing");
        }
        if (req.endDate().isBefore(req.startDate())) {
            throw ApiException.badRequest("Return date must be on or after the start date");
        }
        if (requests.countOverlapping(item.getId(), BLOCKING, -1L, req.startDate(), req.endDate()) > 0) {
            throw ApiException.conflict("These dates overlap with an existing approved booking. Please pick other dates.");
        }
        BorrowRequest r = new BorrowRequest();
        r.setItem(item);
        r.setBorrower(borrower);
        r.setStartDate(req.startDate());
        r.setEndDate(req.endDate());
        r.setMessage(req.message() == null || req.message().isBlank() ? null : req.message().trim());
        r.setStatus(RequestStatus.PENDING);
        return Dtos.toDto(requests.save(r));
    }

    @Transactional
    public BorrowRequestDto approve(Long id) {
        BorrowRequest r = ownedByCurrentUser(id);
        expect(r, RequestStatus.PENDING);
        if (r.getEndDate().isBefore(LocalDate.now())) {
            throw ApiException.conflict("This request's dates are already in the past");
        }
        if (requests.countOverlapping(r.getItem().getId(), BLOCKING, r.getId(), r.getStartDate(), r.getEndDate()) > 0) {
            throw ApiException.conflict("Cannot approve: overlaps with another approved booking for this item");
        }
        r.setStatus(RequestStatus.APPROVED);
        return Dtos.toDto(r);
    }

    @Transactional
    public BorrowRequestDto reject(Long id) {
        BorrowRequest r = ownedByCurrentUser(id);
        expect(r, RequestStatus.PENDING);
        r.setStatus(RequestStatus.REJECTED);
        return Dtos.toDto(r);
    }

    @Transactional
    public BorrowRequestDto handover(Long id) {
        BorrowRequest r = ownedByCurrentUser(id);
        expect(r, RequestStatus.APPROVED);
        Item item = r.getItem();
        if (item.getStatus() == ItemStatus.BORROWED || requests.existsByItemIdAndStatus(item.getId(), RequestStatus.ACTIVE)) {
            throw ApiException.conflict("This item is already out with another borrower");
        }
        r.setStatus(RequestStatus.ACTIVE);
        item.setStatus(ItemStatus.BORROWED);
        return Dtos.toDto(r);
    }

    @Transactional
    public BorrowRequestDto markReturned(Long id) {
        BorrowRequest r = ownedByCurrentUser(id);
        expect(r, RequestStatus.ACTIVE);
        r.setStatus(RequestStatus.RETURNED);
        r.getItem().setStatus(ItemStatus.AVAILABLE);
        return Dtos.toDto(r);
    }

    /** Borrower cancels PENDING; owner may cancel an APPROVED booking that has not been handed over. */
    @Transactional
    public BorrowRequestDto cancel(Long id) {
        User u = auth.currentUser();
        BorrowRequest r = find(id);
        boolean isBorrower = r.getBorrower().getId().equals(u.getId());
        boolean isOwner = r.getItem().getOwner().getId().equals(u.getId());
        if (!isBorrower && !isOwner) throw ApiException.forbidden("You are not part of this request");
        if (isBorrower && r.getStatus() == RequestStatus.PENDING) {
            r.setStatus(RequestStatus.CANCELLED);
        } else if (isOwner && r.getStatus() == RequestStatus.APPROVED) {
            r.setStatus(RequestStatus.CANCELLED);
        } else {
            throw ApiException.conflict("A request in status " + r.getStatus()
                    + " cannot be cancelled by you");
        }
        return Dtos.toDto(r);
    }

    /** Admin moderation: force-cancel any non-final request, releasing the item if it was out. */
    @Transactional
    public BorrowRequestDto adminCancel(Long id) {
        BorrowRequest r = find(id);
        if (r.getStatus() == RequestStatus.RETURNED || r.getStatus() == RequestStatus.CANCELLED
                || r.getStatus() == RequestStatus.REJECTED) {
            throw ApiException.conflict("Request is already closed (" + r.getStatus() + ")");
        }
        if (r.getStatus() == RequestStatus.ACTIVE) r.getItem().setStatus(ItemStatus.AVAILABLE);
        r.setStatus(RequestStatus.CANCELLED);
        return Dtos.toDto(r);
    }

    private BorrowRequest find(Long id) {
        return requests.findDetailed(id).orElseThrow(() -> ApiException.notFound("Request not found"));
    }

    private BorrowRequest ownedByCurrentUser(Long id) {
        BorrowRequest r = find(id);
        if (!r.getItem().getOwner().getId().equals(auth.currentUser().getId())) {
            throw ApiException.forbidden("Only the item owner can perform this action");
        }
        return r;
    }

    private void expect(BorrowRequest r, RequestStatus expected) {
        if (r.getStatus() != expected) {
            throw ApiException.conflict("Invalid transition: request is " + r.getStatus() + ", expected " + expected);
        }
    }
}
