let loader = document.querySelector(".loader-wrapper");
let closeCard = document.querySelector(".close-card");
let itemQuantity = document.querySelector(".quantity");
let totalPrice = document.querySelector(".total");
let productList = document.querySelector(".product-list");
let sideCard = document.querySelector(".card");
let shoppingIcon = document.querySelector(".cart-img");
let searchInput = document.getElementById("search-input");
let sortSelect = document.getElementById("sort-select");
let cart = JSON.parse(localStorage.getItem("cart")) || {};
let allProducts = [];

function saveCartToLocalStorage() {
  localStorage.setItem("cart", JSON.stringify(cart));
}

shoppingIcon.addEventListener("click", () => {
  sideCard.classList.toggle("show");
  document.querySelector(".container").classList.toggle("move-right");
});

closeCard.addEventListener("click", () => {
  sideCard.classList.remove("show");
  document.querySelector(".container").classList.remove("move-right");
});

function showToast(message) {
  const toastContainer = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

async function fetchProducts() {
  try {
    loader.style.display = "flex";
    const response = await fetch("https://dummyjson.com/products");
    const data = await response.json();
    loader.style.display = "none";
    allProducts = data.products;
    renderProducts(allProducts);
    updateCartUI();
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

fetchProducts();

function renderProducts(products) {
  productList.innerHTML = "";
  products.forEach((product) => {
    let card = document.createElement("div");
    card.classList.add("product-card");
    card.innerHTML = `
      <img src="${product.thumbnail}" alt="${product.title}" />
      <h3>${product.title}</h3>
      <p>Price: $${product.price}</p>
      <button class="add-to-cart-btn">Add to Cart</button>
    `;
    productList.appendChild(card);
  });
  attachAddToCartButtons(products);
}

function updateCartUI() {
  const cartList = document.querySelector(".card-list");
  cartList.innerHTML = "";
  let total = 0;
  Object.values(cart).forEach((item) => {
    const itemDiv = document.createElement("div");
    itemDiv.className = "cart-item";
    itemDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 1rem;">
        <img src="${item.thumbnail}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;" />
        <div style="flex: 1;">
          <div style="font-size: 0.9rem;">${item.title}</div>
          <div>$${item.price} x ${item.quantity} = $${item.price * item.quantity}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: center; gap: 5px;">
          <button class="inc" data-id="${item.id}">+</button>
          <span>${item.quantity}</span>
          <button class="dec" data-id="${item.id}">-</button>
        </div>
      </div>
    `;
    cartList.appendChild(itemDiv);
    total += item.price * item.quantity;
  });
  const totalItems = Object.values(cart).reduce((sum, it) => sum + it.quantity, 0);
  itemQuantity.textContent = totalItems;
  totalPrice.textContent = `$${total.toFixed(2)}`;
  handleCartButtons();
  saveCartToLocalStorage();
}

function handleCartButtons() {
  document.querySelectorAll(".inc").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      cart[id].quantity++;
      updateCartUI();
      showToast(`Increased: ${cart[id].title}`);
    });
  });

  document.querySelectorAll(".dec").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      if (cart[id].quantity > 1) {
        cart[id].quantity--;
        showToast(`Decreased: ${cart[id].title}`);
      } else {
        showToast(`Removed: ${cart[id].title}`);
        delete cart[id];
      }
      updateCartUI();
    });
  });
}

function attachAddToCartButtons(products) {
  document.querySelectorAll(".add-to-cart-btn").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      const product = products[i];
      if (cart[product.id]) {
        cart[product.id].quantity++;
        showToast(`Cart updated: ${product.title}`);
      } else {
        cart[product.id] = {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          quantity: 1,
        };
        showToast(`Added: ${product.title}`);
      }
      updateCartUI();
    });
  });
}

searchInput.addEventListener("input", handleSearchSort);
sortSelect.addEventListener("change", handleSearchSort);

function handleSearchSort() {
  let filtered = allProducts.filter(p =>
    p.title.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  const sortValue = sortSelect.value;
  if (sortValue === "low-high") filtered.sort((a, b) => a.price - b.price);
  else if (sortValue === "high-low") filtered.sort((a, b) => b.price - a.price);
  else if (sortValue === "a-z") filtered.sort((a, b) => a.title.localeCompare(b.title));
  else if (sortValue === "z-a") filtered.sort((a, b) => b.title.localeCompare(a.title));

  renderProducts(filtered);
}

const backToTopBtn = document.getElementById("back-to-top");
window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    backToTopBtn.style.display = "block";
  } else {
    backToTopBtn.style.display = "none";
  }
});

// Back to Top Smooth Scroll
backToTopBtn.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Theme toggle logic
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
  localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
});

// Load saved theme on page load
window.addEventListener("DOMContentLoaded", () => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "light") {
    document.body.classList.add("light-mode");
  }
});