# ASP.NET MVC Product Management Application

This project is a sample Product Management Page built with ASP.NET MVC, jQuery, and Bootstrap 5. It demonstrates best practices in modern front-end web development, including product listing, filtering, searching, product details, cart management, and a responsive UI.

## Features

- **Product Grid**: Display products fetched from an external API (Fake Store API) in a paginated grid.
- **Dynamic Filtering**: Filter products by category (client-side, without full page reload).
- **Search with Highlight**: Search products by title, with matching text highlighted.
- **Product Details Modal**: View detailed information, image, ratings, and add-to-cart from a modal.
- **Shopping Cart**: Add to cart from product grid or modal. Cart with total price is available from the navbar/off-canvas.
- **Navigation & Footer**: Sticky navigation bar with cart item count; footer with company details and social media.
- **Mobile-First & Responsive**: Fully responsive design using Bootstrap 5.
- **User Feedback**: Visual feedback and notifications for adding items to the cart.
- **Performance**: Optimized images, minified scripts, and SEO meta tags.

## Setup

1. **Requirements**: [.NET 8 SDK](https://dotnet.microsoft.com/en-us/download) or newer.
2. **Install Dependencies**: Restore NuGet packages in Visual Studio or via CLI:
3. **Run the App**:
The app will be available at `https://localhost:xxxx` or `http://localhost:5188`.

4. **API Source**: This app fetches product and category data from https://fakestoreapi.com/.

## Code Structure

- **Controllers/**: MVC controllers for routing and API endpoints.
- **Models/**: Data models for products, cart, etc.
- **Services/**: API data fetching logic.
- **Views/**: Razor views for each page (Home, Products, etc.).
- **wwwroot/js/**: JavaScript for dynamic UI (products, cart, notifications).
- **wwwroot/css/**: Custom CSS, including notification and card styles.

## Assumptions & Notes

- All API data is fetched in real-time from Fake Store API.
- No backend database is used except for temporary cart storage in `localStorage`.
- All code follows clean, modular, and documented coding standards.

## How to Use

- Navigate between Home, Products, and Contact Us via the sticky navbar.
- Use the category filter and search to narrow results.
- Click "View Details" for modal info (with Add to Cart inside).
- Clicking cart icon opens the cart off-canvas for managing cart contents.

## Contact

For questions, contact the developer
