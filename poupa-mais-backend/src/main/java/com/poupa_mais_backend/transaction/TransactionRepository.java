package com.poupa_mais_backend.transaction;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @EntityGraph(attributePaths = "category")
    List<Transaction> findByUserIdOrderByDateDescIdDesc(Long userId);

    @Query("""
            select t.type as type, coalesce(sum(t.amount), 0) as total
            from Transaction t
            where t.user.id = :userId
              and (:startDate is null or t.date >= :startDate)
              and (:endDate is null or t.date <= :endDate)
            group by t.type
            """)
    List<TransactionTypeTotal> sumAmountByTypeForUser(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("""
            select t.category.id as categoryId, t.category.name as categoryName,
                   t.type as type, coalesce(sum(t.amount), 0) as total
            from Transaction t
            where t.user.id = :userId
              and (:startDate is null or t.date >= :startDate)
              and (:endDate is null or t.date <= :endDate)
              and (:type is null or t.type = :type)
            group by t.category.id, t.category.name, t.type
            order by total desc, t.category.name asc
            """)
    List<CategoryTotal> sumAmountByCategoryForUser(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("type") TransactionType type);
}
