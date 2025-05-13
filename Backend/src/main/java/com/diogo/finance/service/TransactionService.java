package com.diogo.finance.service;

import com.diogo.finance.dto.SummaryResponse;
import com.diogo.finance.dto.TransactionRequest;
import com.diogo.finance.dto.TransactionResponse;
import com.diogo.finance.model.Category;
import com.diogo.finance.model.Transaction;
import com.diogo.finance.model.User;
import com.diogo.finance.repository.CategoryRepository;
import com.diogo.finance.repository.TransactionRepository;
import com.diogo.finance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    public TransactionResponse addTransaction(TransactionRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        Transaction transaction = new Transaction();
        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());
        transaction.setType(request.getType());

        Transaction saved = transactionRepository.save(transaction);

        return new TransactionResponse(
                saved.getId(),
                saved.getDescription(),
                saved.getAmount(),
                saved.getType(),
                saved.getDate(),
                saved.getCategory().getName()
        );
    }

    public List<TransactionResponse> getAllTransactions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return transactionRepository.findByUser(user).stream()
                .map(t -> new TransactionResponse(
                        t.getId(),
                        t.getDescription(),
                        t.getAmount(),
                        t.getType(),
                        t.getDate(),
                        t.getCategory().getName()))
                .collect(Collectors.toList());
    }

    public void deleteTransaction(Long id) {
        transactionRepository.deleteById(id);
    }

    public Double calculateBalance(Long userId, LocalDate start, LocalDate end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(user, start, end);

        return transactions.stream()
                .mapToDouble(t -> t.getType().equalsIgnoreCase("INCOME") ? t.getAmount() : -t.getAmount())
                .sum();
    }

    public Map<String, Double> getTotalsByType(Long userId, LocalDate start, LocalDate end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(user, start, end);

        return transactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getType,
                        Collectors.summingDouble(Transaction::getAmount)
                ));
    }

    public Map<String, Double> getTotalsByCategory(Long userId, LocalDate start, LocalDate end) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(user, start, end);

        return transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.summingDouble(Transaction::getAmount)
                ));
    }

    public SummaryResponse getSummary(Long userId, LocalDate start, LocalDate end) {
        Double balance = calculateBalance(userId, start, end);
        Map<String, Double> byType = getTotalsByType(userId, start, end);
        Map<String, Double> byCategory = getTotalsByCategory(userId, start, end);

        return new SummaryResponse(balance, byType, byCategory);
    }

}
