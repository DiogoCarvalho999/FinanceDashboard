package com.diogo.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

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
    private String category;
}
