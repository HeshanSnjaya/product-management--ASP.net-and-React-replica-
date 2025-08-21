namespace ProductManagementApp.Models
{
    public class CartItem
    {
        public Product Product { get; set; } = new Product();
        public int Quantity { get; set; }
        public decimal TotalPrice => Product.Price * Quantity;
    }

    public class Cart
    {
        public List<CartItem> Items { get; set; } = new List<CartItem>();
        public decimal TotalAmount => Items.Sum(x => x.TotalPrice);
        public int TotalItems => Items.Sum(x => x.Quantity);
    }
}
