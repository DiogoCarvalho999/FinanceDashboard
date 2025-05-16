package com.diogo.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import com.diogo.finance.model.Transaction;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private String description;
    private Double amount;
    private String type;
    private LocalDate date;
    private Long categoryId;         // <-- novo campo
    private String categoryName;     // renomeei de "category" para deixar claro

    public TransactionResponse(Transaction transaction) {
        this.id = transaction.getId();
        this.description = transaction.getDescription();
        this.amount = transaction.getAmount();
        this.type = transaction.getType();
        this.date = transaction.getDate();
        this.categoryId = transaction.getCategory() != null ? transaction.getCategory().getId() : null;
        this.categoryName = transaction.getCategory() != null ? transaction.getCategory().getName() : null;
    }
}

