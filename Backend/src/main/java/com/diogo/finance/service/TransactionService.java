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
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Service;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
        System.out.println("➡️ Categorias disponíveis:");
        categoryRepository.findAll().forEach(c -> System.out.println(c.getId() + " - " + c.getName()));
        System.out.println("🧪 CategoryId recebido: " + request.getCategoryId());
        User user = userRepository.findByEmail(request.getEmail())
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
                saved.getCategory().getId(),     // ✅ categoryId
                saved.getCategory().getName()    // ✅ categoryName
        );
    }

    public TransactionResponse updateTransaction(Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        transaction.setUser(user);
        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setDate(request.getDate());
        transaction.setDescription(request.getDescription());
        transaction.setType(request.getType());

        Transaction updated = transactionRepository.save(transaction);

        return new TransactionResponse(
                updated.getId(),
                updated.getDescription(),
                updated.getAmount(),
                updated.getType(),
                updated.getDate(),
                updated.getCategory().getId(),
                updated.getCategory().getName()
        );

    }

    public List<TransactionResponse> getAllTransactions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return transactionRepository.findByUserOrderByDateDesc(user).stream()
                .map(t -> new TransactionResponse(
                        t.getId(),
                        t.getDescription(),
                        t.getAmount(),
                        t.getType(),
                        t.getDate(),
                        t.getCategory().getId(),       // ✅ categoryId
                        t.getCategory().getName()      // ✅ categoryName
                ))
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

    public List<TransactionResponse> getTransactionsByUserId(Long userId) {
        return transactionRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(TransactionResponse::new)
                .toList();
    }

    public List<Transaction> getTransactionsByEmail(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.map(u -> transactionRepository.findByUserIdOrderByDateDesc(u.getId()))
                .orElse(Collections.emptyList());
    }
    public Double calculateBalanceByEmail(String email, LocalDate start, LocalDate end) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetween(user, start, end);

        return transactions.stream()
                .mapToDouble(t -> t.getType().equalsIgnoreCase("INCOME") ? t.getAmount() : -t.getAmount())
                .sum();
    }

    public Map<String, Double> getTotalsByTypeByEmail(String email, LocalDate start, LocalDate end) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetweenOrderByDateDesc(user, start, end);

        return transactions.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getType,
                        Collectors.summingDouble(Transaction::getAmount)
                ));
    }
    public List<TransactionResponse> getTransactionsByEmailAndDateRange(String email, LocalDate start, LocalDate end) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetweenOrderByDateDesc(user, start, end);

        return transactions.stream()
                .map(t -> new TransactionResponse(
                        t.getId(),
                        t.getDescription(),
                        t.getAmount(),
                        t.getType(),
                        t.getDate(),
                        t.getCategory().getId(),     // ✅ categoryId
                        t.getCategory().getName()    // ✅ categoryName
                ))
                .toList();
    }


    public Map<String, Double> getTotalsByCategoryByEmail(String email, LocalDate start, LocalDate end) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Transaction> transactions = transactionRepository.findByUserAndDateBetweenOrderByDateDesc(user, start, end);

        return transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getCategory().getName(),
                        Collectors.summingDouble(Transaction::getAmount)
                ));
    }

    public SummaryResponse getSummaryByEmail(String email, LocalDate start, LocalDate end) {
        Double balance = calculateBalanceByEmail(email, start, end);
        Map<String, Double> byType = getTotalsByTypeByEmail(email, start, end);
        Map<String, Double> byCategory = getTotalsByCategoryByEmail(email, start, end);

        return new SummaryResponse(balance, byType, byCategory);
    }
}
