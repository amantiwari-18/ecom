// ProductFilterDTO.java (Manual version without Lombok)
package com.school.ecommerce.dto;

import java.util.List;

public class ProductFilterDTO {
    private String search;
    private String category;
    private Double minPrice;
    private Double maxPrice;
    private Boolean inStock;
    private Boolean localSale;
    private List<String> platforms;
    private Boolean hasExternalLinks;
    private Boolean isNew;
    private String sortBy = "newest";
    private int page = 1;
    private int limit = 12;
    private boolean includeHits = false;

    // Constructors
    public ProductFilterDTO() {
    }

    public ProductFilterDTO(String search, String category, Double minPrice, Double maxPrice,
            Boolean inStock, Boolean localSale, List<String> platforms,
            Boolean hasExternalLinks, Boolean isNew, String sortBy,
            int page, int limit, boolean includeHits) {
        this.search = search;
        this.category = category;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.inStock = inStock;
        this.localSale = localSale;
        this.platforms = platforms;
        this.hasExternalLinks = hasExternalLinks;
        this.isNew = isNew;
        this.sortBy = sortBy;
        this.page = page;
        this.limit = limit;
        this.includeHits = includeHits;
    }

    // Builder static method
    public static Builder builder() {
        return new Builder();
    }

    // Builder class
    public static class Builder {
        private String search;
        private String category;
        private Double minPrice;
        private Double maxPrice;
        private Boolean inStock;
        private Boolean localSale;
        private List<String> platforms;
        private Boolean hasExternalLinks;
        private Boolean isNew;
        private String sortBy = "newest";
        private int page = 1;
        private int limit = 12;
        private boolean includeHits = false;

        public Builder search(String search) {
            this.search = search;
            return this;
        }

        public Builder category(String category) {
            this.category = category;
            return this;
        }

        public Builder minPrice(Double minPrice) {
            this.minPrice = minPrice;
            return this;
        }

        public Builder maxPrice(Double maxPrice) {
            this.maxPrice = maxPrice;
            return this;
        }

        public Builder inStock(Boolean inStock) {
            this.inStock = inStock;
            return this;
        }

        public Builder localSale(Boolean localSale) {
            this.localSale = localSale;
            return this;
        }

        public Builder platforms(List<String> platforms) {
            this.platforms = platforms;
            return this;
        }

        public Builder hasExternalLinks(Boolean hasExternalLinks) {
            this.hasExternalLinks = hasExternalLinks;
            return this;
        }

        public Builder isNew(Boolean isNew) {
            this.isNew = isNew;
            return this;
        }

        public Builder sortBy(String sortBy) {
            this.sortBy = sortBy;
            return this;
        }

        public Builder page(int page) {
            this.page = page;
            return this;
        }

        public Builder limit(int limit) {
            this.limit = limit;
            return this;
        }

        public Builder includeHits(boolean includeHits) {
            this.includeHits = includeHits;
            return this;
        }

        public ProductFilterDTO build() {
            return new ProductFilterDTO(
                    search, category, minPrice, maxPrice, inStock, localSale,
                    platforms, hasExternalLinks, isNew, sortBy, page, limit, includeHits);
        }
    }

    // Getters and Setters
    public String getSearch() {
        return search;
    }

    public void setSearch(String search) {
        this.search = search;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(Double minPrice) {
        this.minPrice = minPrice;
    }

    public Double getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(Double maxPrice) {
        this.maxPrice = maxPrice;
    }

    public Boolean getInStock() {
        return inStock;
    }

    public void setInStock(Boolean inStock) {
        this.inStock = inStock;
    }

    public Boolean getLocalSale() {
        return localSale;
    }

    public void setLocalSale(Boolean localSale) {
        this.localSale = localSale;
    }

    public List<String> getPlatforms() {
        return platforms;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }

    public Boolean getHasExternalLinks() {
        return hasExternalLinks;
    }

    public void setHasExternalLinks(Boolean hasExternalLinks) {
        this.hasExternalLinks = hasExternalLinks;
    }

    public Boolean getIsNew() {
        return isNew;
    }

    public void setIsNew(Boolean isNew) {
        this.isNew = isNew;
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = page;
    }

    public int getLimit() {
        return limit;
    }

    public void setLimit(int limit) {
        this.limit = limit;
    }

    public boolean isIncludeHits() {
        return includeHits;
    }

    public void setIncludeHits(boolean includeHits) {
        this.includeHits = includeHits;
    }
}