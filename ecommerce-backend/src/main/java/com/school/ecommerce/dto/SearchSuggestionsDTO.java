package com.school.ecommerce.dto;

import lombok.Data;
import java.util.List;

@Data
public class SearchSuggestionsDTO {

    private List<ProductSuggestionDTO> products;
    private List<CategorySuggestionDTO> categories;
    private List<String> suggestions;
}
