using Newtonsoft.Json;
using ProductManagementApp.Models;

namespace ProductManagementApp.Services
{
    public class ProductService : IProductService
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ProductService> _logger;
        private const string BaseUrl = "https://fakestoreapi.com";

        public ProductService(HttpClient httpClient, ILogger<ProductService> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        public async Task<ProductListResponse> GetProductsAsync(int page = 1, int pageSize = 10, string category = "", string search = "")
        {
            try
            {
                var url = $"{BaseUrl}/products";
                if (!string.IsNullOrEmpty(category) && category != "all")
                {
                    url += $"/category/{category}";
                }

                var response = await _httpClient.GetStringAsync(url);
                var products = JsonConvert.DeserializeObject<List<Product>>(response) ?? new List<Product>();

                if (!string.IsNullOrEmpty(search))
                {
                    products = products.Where(p => 
                        p.Title?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false)
                        .ToList();
                }

                var totalCount = products.Count;
                var pagedProducts = products
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToList();

                var categories = await GetCategoriesAsync();

                return new ProductListResponse
                {
                    Products = pagedProducts,
                    TotalCount = totalCount,
                    PageSize = pageSize,
                    CurrentPage = page,
                    Categories = categories
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching products");
                return new ProductListResponse();
            }
        }

        public async Task<Product?> GetProductByIdAsync(int id)
        {
            try
            {
                var response = await _httpClient.GetStringAsync($"{BaseUrl}/products/{id}");
                return JsonConvert.DeserializeObject<Product>(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching product {id}");
                return null;
            }
        }

        public async Task<List<string>> GetCategoriesAsync()
        {
            try
            {
                var response = await _httpClient.GetStringAsync($"{BaseUrl}/products/categories");
                var categories = JsonConvert.DeserializeObject<List<string>>(response) ?? new List<string>();
                categories.Insert(0, "all");
                return categories;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching categories");
                return new List<string> { "all" };
            }
        }
    }
}
