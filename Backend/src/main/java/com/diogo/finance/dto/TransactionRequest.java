package com.diogo.finance.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class TransactionRequest {
    private Long id;
    private String description;
    private Double amount;
    private String type; // "INCOME" ou "EXPENSE"
    private LocalDate date;
    private Long categoryId;
    private String email;
}

