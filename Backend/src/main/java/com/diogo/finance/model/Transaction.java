package com.diogo.finance.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue
    private Long id;

    private String description;
    private Double amount;
    private LocalDate date;

    @ManyToOne
    private Category category;

    @ManyToOne
    private User user;

    private String type; // "INCOME" ou "EXPENSE"
}

