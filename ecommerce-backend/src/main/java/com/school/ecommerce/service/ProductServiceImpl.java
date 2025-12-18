package com.school.ecommerce.service;

import com.school.ecommerce.dto.ProductDTO;
import com.school.ecommerce.model.Product;
import com.school.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    public ProductDTO create(ProductDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategoryId(dto.getCategoryId());
        product.setImages(dto.getImages() != null ? dto.getImages() : new ArrayList<>());
        product.setAvailablePlatforms(dto.getAvailablePlatforms());
        product.setLocalSale(dto.isLocalSale());

        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    @Override
    public ProductDTO createWithImage(ProductDTO dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategoryId(dto.getCategoryId());
        product.setAvailablePlatforms(dto.getAvailablePlatforms());
        product.setLocalSale(dto.isLocalSale());

        // Handle image upload
        List<String> images = new ArrayList<>();
        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            String base64Image = encodeImageToBase64(dto.getImage());
            images.add(base64Image);
        }
        product.setImages(images);

        Product saved = productRepository.save(product);
        return convertToDTO(saved);
    }

    @Override
    public ProductDTO getById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDTO(product);
    }

    @Override
    public List<ProductDTO> getAll() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> getByCategory(String categoryId) {
        return productRepository.findByCategoryId(categoryId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public ProductDTO update(String id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (dto.getName() != null)
            product.setName(dto.getName());
        if (dto.getDescription() != null)
            product.setDescription(dto.getDescription());
        if (dto.getPrice() > 0)
            product.setPrice(dto.getPrice());
        if (dto.getCategoryId() != null)
            product.setCategoryId(dto.getCategoryId());
        if (dto.getAvailablePlatforms() != null)
            product.setAvailablePlatforms(dto.getAvailablePlatforms());
        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            List<String> images = product.getImages() != null ? product.getImages() : new ArrayList<>();
            images.add(encodeImageToBase64(dto.getImage()));
            product.setImages(images);
        }
        product.setLocalSale(dto.isLocalSale());

        Product updated = productRepository.save(product);
        return convertToDTO(updated);
    }

    @Override
    public void delete(String id) {
        productRepository.deleteById(id);
    }

    private String encodeImageToBase64(MultipartFile file) {
        try {
            return Base64.getEncoder().encodeToString(file.getBytes());
        } catch (Exception e) {
            throw new RuntimeException("Error encoding image: " + e.getMessage());
        }
    }

    private ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setCategoryId(product.getCategoryId());
        dto.setImages(product.getImages());
        dto.setAvailablePlatforms(product.getAvailablePlatforms());
        dto.setLocalSale(product.isLocalSale());
        return dto;
    }
}
