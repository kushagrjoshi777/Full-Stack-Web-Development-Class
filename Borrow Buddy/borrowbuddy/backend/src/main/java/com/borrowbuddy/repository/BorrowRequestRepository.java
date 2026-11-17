package com.borrowbuddy.repository;

import com.borrowbuddy.entity.BorrowRequest;
import com.borrowbuddy.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {

    String FETCH = "select r from BorrowRequest r join fetch r.item i join fetch i.owner join fetch i.category join fetch r.borrower ";

    @Query(FETCH + "where r.borrower.id = :userId order by r.createdAt desc")
    List<BorrowRequest> findOutgoing(@Param("userId") Long userId);

    @Query(FETCH + "where i.owner.id = :userId order by r.createdAt desc")
    List<BorrowRequest> findIncoming(@Param("userId") Long userId);

    @Query(FETCH + "order by r.createdAt desc")
    List<BorrowRequest> findAllWithDetails();

    @Query(FETCH + "where r.id = :id")
    java.util.Optional<BorrowRequest> findDetailed(@Param("id") Long id);

    @Query(FETCH + "where i.id = :itemId and r.status in :statuses order by r.startDate")
    List<BorrowRequest> findByItemAndStatuses(@Param("itemId") Long itemId,
                                              @Param("statuses") Collection<RequestStatus> statuses);

    @Query("""
            select count(r) from BorrowRequest r
            where r.item.id = :itemId and r.status in :statuses
              and r.id <> :excludeId
              and r.startDate <= :end and r.endDate >= :start
            """)
    long countOverlapping(@Param("itemId") Long itemId,
                          @Param("statuses") Collection<RequestStatus> statuses,
                          @Param("excludeId") Long excludeId,
                          @Param("start") LocalDate start,
                          @Param("end") LocalDate end);

    long countByStatus(RequestStatus status);

    @Query("select count(r) from BorrowRequest r where r.item.owner.id = :userId and r.status = :status")
    long countIncomingByStatus(@Param("userId") Long userId, @Param("status") RequestStatus status);

    @Query("select count(r) from BorrowRequest r where r.borrower.id = :userId and r.status = :status")
    long countOutgoingByStatus(@Param("userId") Long userId, @Param("status") RequestStatus status);

    boolean existsByItemIdAndStatus(Long itemId, RequestStatus status);
}
