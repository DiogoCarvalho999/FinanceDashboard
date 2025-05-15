package com.diogo.finance.controller;

import com.diogo.finance.dto.SummaryResponse;
import com.diogo.finance.dto.TransactionRequest;
import com.diogo.finance.dto.TransactionResponse;
import com.diogo.finance.model.Transaction;
import com.diogo.finance.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    @PostMapping
    public TransactionResponse addTransaction(@RequestBody TransactionRequest request) {
        return transactionService.addTransaction(request);
    }
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            @PathVariable Long id,
            @RequestBody TransactionRequest request
    ) {
        return ResponseEntity.ok(transactionService.updateTransaction(id, request));
    }


    @GetMapping("/summary")
    public SummaryResponse getSummary(
            @RequestParam Long userId,
            @RequestParam String start,
            @RequestParam String end) {

        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        return transactionService.getSummary(userId, startDate, endDate);
    }

    //  ENDPOINT ALTERADO PARA LIDAR COM EMAIL
    @GetMapping("/by-email/{email}")
    public List<Transaction> getTransactionsByEmail(@PathVariable String email) {
        return transactionService.getTransactionsByEmail(email);
    }
    @GetMapping("/summary/by-email")
    public SummaryResponse getSummaryByEmail(
            @RequestParam String email,
            @RequestParam String start,
            @RequestParam String end) {
        return transactionService.getSummaryByEmail(email, LocalDate.parse(start), LocalDate.parse(end));
    }

    @GetMapping("/totals/by-type/by-email")
    public Map<String, Double> getTotalsByTypeByEmail(
            @RequestParam String email,
            @RequestParam String start,
            @RequestParam String end) {
        return transactionService.getTotalsByTypeByEmail(email, LocalDate.parse(start), LocalDate.parse(end));
    }

    @GetMapping("/totals/by-category/by-email")
    public Map<String, Double> getTotalsByCategoryByEmail(
            @RequestParam String email,
            @RequestParam String start,
            @RequestParam String end) {
        return transactionService.getTotalsByCategoryByEmail(email, LocalDate.parse(start), LocalDate.parse(end));
    }

    //  Antigo endpoint mantido para compatibilidade
    @GetMapping("/{userId}")
    public List<TransactionResponse> getTransactions(@PathVariable Long userId) {
        return transactionService.getAllTransactions(userId);
    }

    @DeleteMapping("/{id}")
    public void deleteTransaction(@PathVariable Long id) {
        transactionService.deleteTransaction(id);
    }

    @GetMapping("/balance")
    public Double getBalance(
            @RequestParam Long userId,
            @RequestParam String start,
            @RequestParam String end) {

        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        return transactionService.calculateBalance(userId, startDate, endDate);
    }

    @GetMapping("/totals-by-type")
    public Map<String, Double> getTotalsByType(
            @RequestParam Long userId,
            @RequestParam String start,
            @RequestParam String end) {

        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        return transactionService.getTotalsByType(userId, startDate, endDate);
    }

    @GetMapping("/totals-by-category")
    public Map<String, Double> getTotalsByCategory(
            @RequestParam Long userId,
            @RequestParam String start,
            @RequestParam String end) {

        LocalDate startDate = LocalDate.parse(start);
        LocalDate endDate = LocalDate.parse(end);
        return transactionService.getTotalsByCategory(userId, startDate, endDate);
    }
}
