// PaginatedResponseDTO.java
package com.school.ecommerce.dto;

import lombok.Data;
import java.util.List;

@Data
public class PaginatedResponseDTO<T> {
    private List<T> data;
    private PaginationInfoDTO pagination;
    private Object filters;
}