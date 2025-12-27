package com.school.ecommerce.dto;

import lombok.Data;

@Data
public class PaginationInfoDTO {

    private int page;
    private int limit;
    private long total;
    private int totalPages;
    private boolean hasNext;
    private boolean hasPrev;
}
