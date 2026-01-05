package com.school.ecommerce.service;

import com.school.ecommerce.dto.ProductDTO;
import com.school.ecommerce.model.ExternalLink;
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

    /* ===================== CREATE ===================== */

    @Override
    public ProductDTO create(ProductDTO dto) {
        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategoryId(dto.getCategoryId());
        product.setImages(dto.getImages() != null ? dto.getImages() : new ArrayList<>());
        product.setExternalLinks(dto.getExternalLinks());
        product.setAvailablePlatforms(dto.getAvailablePlatforms());

        return convertToDTO(productRepository.save(product));
    }

    @Override
    public ProductDTO createWithImage(ProductDTO dto) {
        Product product = new Product();

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCategoryId(dto.getCategoryId());
        product.setAvailablePlatforms(dto.getAvailablePlatforms());

        List<String> images = new ArrayList<>();
        if (dto.getImage() != null && !dto.getImage().isEmpty()) {
            images.add(encodeImageToBase64(dto.getImage()));
        }
        product.setImages(images);

        return convertToDTO(productRepository.save(product));
    }

    /* ===================== READ ===================== */

    @Override
    public ProductDTO getById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDTO(product);
    }

    @Override
    public List<ProductDTO> getAll() {
        return productRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ProductDTO> getByCategory(String categoryId) {
        return productRepository.findByCategoryId(categoryId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /* ===================== UPDATE (BASIC FIELDS) ===================== */

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

        return convertToDTO(productRepository.save(product));
    }

    /* ===================== UPDATE (ADVANCED FIELDS) ===================== */

    @Override
    public ProductDTO updateExternalLinks(String productId, List<ExternalLink> externalLinks) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setExternalLinks(externalLinks);
        return convertToDTO(productRepository.save(product));
    }

    @Override
    public ProductDTO updatePlatforms(String productId, List<String> platforms) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        product.setAvailablePlatforms(platforms);
        return convertToDTO(productRepository.save(product));
    }

    @Override
    public ProductDTO updateImages(String productId, List<MultipartFile> images) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        List<String> storedImages = new ArrayList<>();

        for (MultipartFile file : images) {
            if (file != null && !file.isEmpty()) {
                storedImages.add(encodeImageToBase64(file));
            }
        }

        product.setImages(storedImages);
        return convertToDTO(productRepository.save(product));
    }

    /* ===================== DELETE ===================== */

    @Override
    public void delete(String id) {
        productRepository.deleteById(id);
    }

    /* ===================== HELPERS ===================== */

    private String encodeImageToBase64(MultipartFile file) {
        try {
            return Base64.getEncoder().encodeToString(file.getBytes());
        } catch (Exception e) {
            throw new RuntimeException("Error encoding image", e);
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
        dto.setExternalLinks(product.getExternalLinks());
        dto.setAvailablePlatforms(product.getAvailablePlatforms());

        return dto;
    }
}
