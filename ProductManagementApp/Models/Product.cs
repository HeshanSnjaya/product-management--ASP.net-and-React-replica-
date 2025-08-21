namespace ProductManagementApp.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public string Image { get; set; } = string.Empty;
        public Rating Rating { get; set; } = new Rating();
    }

    public class Rating
    {
        public decimal Rate { get; set; }
        public int Count { get; set; }
    }

    public class ProductListResponse
    {
        public List<Product> Products { get; set; } = new List<Product>();
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int CurrentPage { get; set; }
        public List<string> Categories { get; set; } = new List<string>();
    }
}
