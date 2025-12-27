package com.school.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ProductSuggestionDTO {

    private String id;
    private String name;
    private String image;
}
