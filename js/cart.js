const productsPerPage = 9;

let products = [];
let filteredProducts = [];
let currentPage = 1;

let category = "";
let color = "";
let size = "";
let style = "";
let search = "";

let maxPrice = 500;
let sortBy = "popular";

document.addEventListener("DOMContentLoaded", function () {
  loadProducts();
  setupFilters();
  setupSorting();
  setupPagination();
  setupMobileFilters();
});

function loadProducts() {
  fetch("data/products.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      products = data;

      setPrice();
      readURL();
      filterProducts();
    })
    .catch(function (error) {
      console.log("Error loading products:", error);
    });
}

function readURL() {
  const params = new URLSearchParams(window.location.search);

  const tag = params.get("tag");
  const styleFromURL = params.get("style");
  const searchFromURL = params.get("search");

  if (tag === "sale") {
    changeTitle("On Sale");
  } else if (tag === "new") {
    changeTitle("New Arrivals");
  } else if (tag === "top-selling") {
    changeTitle("Top Selling");
  } else if (searchFromURL) {
    search = searchFromURL.toLowerCase();
    changeTitle("Search Results");
  } else if (styleFromURL) {
    style = styleFromURL;
    changeTitle(styleFromURL);
  } else {
    changeTitle("Shop");
  }
}

function changeTitle(title) {
  const titleElement = document.getElementById("category-title");
  const breadcrumb = document.querySelector(".category-breadcrumb span");

  if (titleElement) {
    titleElement.textContent = title;
  }

  if (breadcrumb) {
    breadcrumb.textContent = title;
  }
}

function setPrice() {
  const priceRange = document.getElementById("price-range");
  const maxPriceText = document.getElementById("max-price");

  if (!priceRange) {
    return;
  }

  let highestPrice = 0;

  products.forEach(function (product) {
    if (Number(product.price) > highestPrice) {
      highestPrice = Number(product.price);
    }
  });

  maxPrice = highestPrice;

  priceRange.max = highestPrice;
  priceRange.value = highestPrice;

  if (maxPriceText) {
    maxPriceText.textContent = "$" + highestPrice;
  }

  priceRange.addEventListener("input", function () {
    maxPrice = Number(priceRange.value);

    if (maxPriceText) {
      maxPriceText.textContent = "$" + maxPrice;
    }

    filterProducts();
  });
}

function filterProducts() {
  const params = new URLSearchParams(window.location.search);
  const tag = params.get("tag");

  filteredProducts = products.filter(function (product) {
    // Sale page
    if (tag === "sale") {
      if (Number(product.originalPrice) <= Number(product.price)) {
        return false;
      }
    }

    // New products
    if (tag === "new") {
      if (!product.tags || !product.tags.includes("new")) {
        return false;
      }
    }

    // Top selling
    if (tag === "top-selling") {
      if (!product.tags || !product.tags.includes("top-selling")) {
        return false;
      }
    }

    // Search
    if (search) {
      const name = product.name.toLowerCase();
      const productCategory = product.category
        ? product.category.toLowerCase()
        : "";
      const productStyle = product.style ? product.style.toLowerCase() : "";

      if (
        !name.includes(search) &&
        !productCategory.includes(search) &&
        !productStyle.includes(search)
      ) {
        return false;
      }
    }

    if (category && product.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    if (
      style &&
      (!product.style || product.style.toLowerCase() !== style.toLowerCase())
    ) {
      return false;
    }

    if (color) {
      if (!product.colors) {
        return false;
      }

      const foundColor = product.colors.some(function (item) {
        return item.name.toLowerCase() === color.toLowerCase();
      });

      if (!foundColor) {
        return false;
      }
    }

    if (size) {
      if (!product.sizes || !product.sizes.includes(size)) {
        return false;
      }
    }

    if (Number(product.price) > maxPrice) {
      return false;
    }

    return true;
  });

  sortProducts();

  currentPage = 1;

  showProducts();
  showPagination();
  updateCount();
}

function setupFilters() {
  document.querySelectorAll("[data-category]").forEach(function (button) {
    button.addEventListener("click", function () {
      const value = this.dataset.category;

      if (category === value) {
        category = "";
        this.classList.remove("selected");
      } else {
        category = value;

        document.querySelectorAll("[data-category]").forEach(function (item) {
          item.classList.remove("selected");
        });

        this.classList.add("selected");
      }

      filterProducts();
    });
  });

  document.querySelectorAll("[data-style]").forEach(function (button) {
    button.addEventListener("click", function () {
      const value = this.dataset.style;

      if (style === value) {
        style = "";
        this.classList.remove("selected");
      } else {
        style = value;

        document.querySelectorAll("[data-style]").forEach(function (item) {
          item.classList.remove("selected");
        });

        this.classList.add("selected");
      }

      filterProducts();
    });
  });

  document.querySelectorAll("[data-color]").forEach(function (button) {
    button.addEventListener("click", function () {
      const value = this.dataset.color;

      if (color === value) {
        color = "";
        this.classList.remove("selected");
      } else {
        color = value;

        document.querySelectorAll("[data-color]").forEach(function (item) {
          item.classList.remove("selected");
        });

        this.classList.add("selected");
      }

      filterProducts();
    });
  });

  document.querySelectorAll("[data-size]").forEach(function (button) {
    button.addEventListener("click", function () {
      const value = this.dataset.size;

      if (size === value) {
        size = "";
        this.classList.remove("selected");
      } else {
        size = value;

        document.querySelectorAll("[data-size]").forEach(function (item) {
          item.classList.remove("selected");
        });

        this.classList.add("selected");
      }

      filterProducts();
    });
  });

  const applyButton = document.getElementById("apply-filters");

  if (applyButton) {
    applyButton.addEventListener("click", function () {
      filterProducts();
      closeFilters();
    });
  }
}

function setupSorting() {
  const sortSelect = document.getElementById("sort-products");

  if (!sortSelect) {
    return;
  }

  sortSelect.addEventListener("change", function () {
    sortBy = this.value;
    filterProducts();
  });
}

function sortProducts() {
  if (sortBy === "price-low") {
    filteredProducts.sort(function (a, b) {
      return Number(a.price) - Number(b.price);
    });
  } else if (sortBy === "price-high") {
    filteredProducts.sort(function (a, b) {
      return Number(b.price) - Number(a.price);
    });
  } else if (sortBy === "rating") {
    filteredProducts.sort(function (a, b) {
      return Number(b.rating) - Number(a.rating);
    });
  } else {
    filteredProducts.sort(function (a, b) {
      return Number(b.reviewCount) - Number(a.reviewCount);
    });
  }
}

function showProducts() {
  const container = document.getElementById("category-products");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  const start = (currentPage - 1) * productsPerPage;
  const pageProducts = filteredProducts.slice(start, start + productsPerPage);

  if (pageProducts.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <h3>No products found</h3>
        <p>Try changing your filters.</p>
      </div>
    `;

    return;
  }

  pageProducts.forEach(function (product) {
    let oldPrice = "";
    let discount = "";

    if (Number(product.originalPrice) > Number(product.price)) {
      oldPrice = `<span>$${product.originalPrice}</span>`;
    }

    if (Number(product.discount) > 0) {
      discount = `<small>-${product.discount}%</small>`;
    }

    const image = product.images[0];

    const card = document.createElement("div");

    card.className = "col";

    card.innerHTML = `
      <article class="product-card">
        <a href="product.html?id=${product.id}">
          <div class="product-image">
            <img
              src="${image}"
              alt="${product.name}"
              class="img-fluid"
            >
          </div>
        </a>

        <h3>${product.name}</h3>

        <div class="product-rating">
          <div>
            ${stars(product.rating)}
          </div>

          <span>${product.rating}/5</span>
        </div>

        <div class="product-price">
          <strong>$${product.price}</strong>
          ${oldPrice}
          ${discount}
        </div>
      </article>
    `;

    container.appendChild(card);
  });
}

function stars(rating) {
  let result = "";
  const number = Number(rating);

  for (let i = 0; i < Math.floor(number); i++) {
    result += '<i class="bi bi-star-fill"></i>';
  }

  if (number % 1 >= 0.5) {
    result += '<i class="bi bi-star-half"></i>';
  }

  return result;
}

function updateCount() {
  const count = document.getElementById("product-count");

  if (!count) {
    return;
  }

  if (filteredProducts.length === 0) {
    count.textContent = "Showing 0 of 0 Products";
    return;
  }

  const start = (currentPage - 1) * productsPerPage + 1;
  const end = Math.min(currentPage * productsPerPage, filteredProducts.length);

  count.textContent =
    "Showing " +
    start +
    "-" +
    end +
    " of " +
    filteredProducts.length +
    " Products";
}

function setupPagination() {
  const previous = document.getElementById("previous-page");
  const next = document.getElementById("next-page");

  if (previous) {
    previous.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;

        showProducts();
        showPagination();
        updateCount();

        scrollToProducts();
      }
    });
  }

  if (next) {
    next.addEventListener("click", function () {
      const pages = Math.ceil(filteredProducts.length / productsPerPage);

      if (currentPage < pages) {
        currentPage++;

        showProducts();
        showPagination();
        updateCount();

        scrollToProducts();
      }
    });
  }
}

function showPagination() {
  const container = document.getElementById("pagination-numbers");
  const previous = document.getElementById("previous-page");
  const next = document.getElementById("next-page");

  if (!container || !previous || !next) {
    return;
  }

  container.innerHTML = "";

  const pages = Math.ceil(filteredProducts.length / productsPerPage);

  previous.disabled = currentPage === 1 || pages === 0;
  next.disabled = currentPage === pages || pages === 0;

  for (let i = 1; i <= pages; i++) {
    const button = document.createElement("button");

    button.type = "button";
    button.textContent = i;

    if (i === currentPage) {
      button.className = "btn btn-dark";
    } else {
      button.className = "btn btn-outline-dark";
    }

    button.addEventListener("click", function () {
      currentPage = i;

      showProducts();
      showPagination();
      updateCount();

      scrollToProducts();
    });

    container.appendChild(button);
  }
}

function setupMobileFilters() {
  const filters = document.querySelector(".filters");
  const openButton = document.getElementById("open-filters");
  const closeButton = document.querySelector(".filter-close");

  if (openButton) {
    openButton.addEventListener("click", function () {
      filters.classList.add("show");
      document.body.classList.add("filters-open");
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", closeFilters);
  }
}

function closeFilters() {
  const filters = document.querySelector(".filters");

  if (filters) {
    filters.classList.remove("show");
  }

  document.body.classList.remove("filters-open");
}

function scrollToProducts() {
  const products = document.getElementById("category-products");

  if (products) {
    products.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}
