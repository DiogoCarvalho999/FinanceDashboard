package com.diogo.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
public class SummaryResponse {
    private Double balance;
    private Map<String, Double> totalsByType;
    private Map<String, Double> totalsByCategory;
}
