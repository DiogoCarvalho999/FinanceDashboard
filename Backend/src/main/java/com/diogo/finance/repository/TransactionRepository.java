package com.diogo.finance.repository;

import com.diogo.finance.model.Transaction;
import com.diogo.finance.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByUser(User user);
    List<Transaction> findByUserAndDateBetween(User user, LocalDate start, LocalDate end);
}
