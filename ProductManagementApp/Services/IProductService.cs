using ProductManagementApp.Models;

namespace ProductManagementApp.Services
{
    public interface IProductService
    {
        Task<ProductListResponse> GetProductsAsync(int page = 1, int pageSize = 10, string category = "", string search = "");
        Task<Product?> GetProductByIdAsync(int id);
        Task<List<string>> GetCategoriesAsync();
    }
}
