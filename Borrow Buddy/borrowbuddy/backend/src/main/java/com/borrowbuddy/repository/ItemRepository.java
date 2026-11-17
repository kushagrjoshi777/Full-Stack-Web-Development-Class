package com.borrowbuddy.repository;

import com.borrowbuddy.entity.Item;
import com.borrowbuddy.entity.ItemStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    @Query("""
            select i from Item i join fetch i.category join fetch i.owner
            where i.status <> com.borrowbuddy.entity.ItemStatus.UNAVAILABLE
              and lower(i.title) like lower(concat('%', :q, '%'))
              and (:categoryId is null or i.category.id = :categoryId)
              and lower(i.location) like lower(concat('%', :location, '%'))
              and (:priceMode = 'ALL'
                   or (:priceMode = 'FREE' and i.dailyPrice = 0)
                   or (:priceMode = 'PAID' and i.dailyPrice > 0))
            order by i.createdAt desc
            """)
    List<Item> search(@Param("q") String q,
                      @Param("categoryId") Long categoryId,
                      @Param("location") String location,
                      @Param("priceMode") String priceMode);

    @Query("select i from Item i join fetch i.category join fetch i.owner where i.status = com.borrowbuddy.entity.ItemStatus.AVAILABLE order by i.createdAt desc")
    List<Item> findFeatured(Pageable pageable);

    @Query("select i from Item i join fetch i.category join fetch i.owner where i.owner.id = :ownerId order by i.createdAt desc")
    List<Item> findByOwner(@Param("ownerId") Long ownerId);

    @Query("select i from Item i join fetch i.category join fetch i.owner order by i.createdAt desc")
    List<Item> findAllWithDetails();

    @Query("select distinct i.location from Item i order by i.location")
    List<String> findDistinctLocations();

    long countByStatus(ItemStatus status);

    long countByCategoryId(Long categoryId);

    long countByOwnerId(Long ownerId);
}
