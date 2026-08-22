let products = [];
let filteredProducts = [];

let category = "";
let color = "";
let size = "";
let style = "";

let currentPage = 1;
const productsPerPage = 9;

const productsBox = document.getElementById("category-products");
const categoryBox = document.getElementById("category-filters");
const colorBox = document.getElementById("color-filters");
const sizeBox = document.getElementById("size-filters");
const styleBox = document.getElementById("style-filters");

const priceRange = document.getElementById("price-range");
const maxPrice = document.getElementById("max-price");

const productCount = document.getElementById("product-count");
const pageTitle = document.getElementById("category-title");
const breadcrumb = document.getElementById("category-breadcrumb");

const sortBox = document.getElementById("sort-products");

const previousPage = document.getElementById("previous-page");
const nextPage = document.getElementById("next-page");
const pageNumbers = document.getElementById("pagination-numbers");

const openFilters = document.getElementById("open-filters");
const closeFilters = document.querySelector(".filter-close");
const filters = document.querySelector(".filters");

const applyButton = document.getElementById("apply-filters");

let highestPrice = 0;
let price = 0;

fetch("data/products.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    products = data;

    setPrice();
    makeCategoryFilters();
    makeColorFilters();
    makeSizeFilters();
    makeStyleFilters();

    getUrlFilters();
    filterProducts();
  })
  .catch(function (error) {
    console.log("Error loading products:", error);
  });

function setPrice() {
  products.forEach(function (product) {
    if (product.price > highestPrice) {
      highestPrice = product.price;
    }
  });

  price = highestPrice;

  priceRange.max = highestPrice;
  priceRange.value = highestPrice;
  maxPrice.textContent = "$" + highestPrice;
}

function makeCategoryFilters() {
  const categories = [];

  products.forEach(function (product) {
    if (!categories.includes(product.category)) {
      categories.push(product.category);
    }
  });

  categoryBox.innerHTML = "";

  categories.forEach(function (item) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "filter-option";
    button.dataset.category = item;

    button.innerHTML = `
      <span>${item}</span>
      <i class="bi bi-chevron-right"></i>
    `;

    button.addEventListener("click", function () {
      if (category === item) {
        category = "";
      } else {
        category = item;
      }

      currentPage = 1;
      updateButtons();
      filterProducts();
    });

    categoryBox.appendChild(button);
  });
}

function makeColorFilters() {
  const colors = [];

  products.forEach(function (product) {
    product.colors.forEach(function (item) {
      if (!colors.includes(item.name)) {
        colors.push(item.name);
      }
    });
  });

  colorBox.innerHTML = "";

  colors.forEach(function (name) {
    let hex = "#000000";

    products.forEach(function (product) {
      product.colors.forEach(function (item) {
        if (item.name === name) {
          hex = item.hex;
        }
      });
    });

    const button = document.createElement("button");

    button.type = "button";
    button.className = "color-option";
    button.dataset.color = name;
    button.title = name;
    button.setAttribute("aria-label", name);
    button.style.backgroundColor = hex;

    button.addEventListener("click", function () {
      if (color === name) {
        color = "";
      } else {
        color = name;
      }

      currentPage = 1;
      updateButtons();
      filterProducts();
    });

    colorBox.appendChild(button);
  });
}

function makeSizeFilters() {
  const sizes = [];

  products.forEach(function (product) {
    product.sizes.forEach(function (item) {
      if (!sizes.includes(item)) {
        sizes.push(item);
      }
    });
  });

  sizeBox.innerHTML = "";

  sizes.forEach(function (item) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "size-option";
    button.dataset.size = item;
    button.textContent = item;

    button.addEventListener("click", function () {
      if (size === item) {
        size = "";
      } else {
        size = item;
      }

      currentPage = 1;
      updateButtons();
      filterProducts();
    });

    sizeBox.appendChild(button);
  });
}

function makeStyleFilters() {
  const styles = [];

  products.forEach(function (product) {
    if (!styles.includes(product.style)) {
      styles.push(product.style);
    }
  });

  styleBox.innerHTML = "";

  styles.forEach(function (item) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "filter-option";
    button.dataset.style = item;

    button.innerHTML = `
      <span>${item}</span>
      <i class="bi bi-chevron-right"></i>
    `;

    button.addEventListener("click", function () {
      if (style === item) {
        style = "";
      } else {
        style = item;
      }

      currentPage = 1;
      updateButtons();
      filterProducts();
    });

    styleBox.appendChild(button);
  });
}

function updateButtons() {
  document.querySelectorAll("[data-category]").forEach(function (button) {
    button.classList.toggle("selected", button.dataset.category === category);
  });

  document.querySelectorAll("[data-color]").forEach(function (button) {
    button.classList.toggle("selected", button.dataset.color === color);
  });

  document.querySelectorAll("[data-size]").forEach(function (button) {
    button.classList.toggle("selected", button.dataset.size === size);
  });

  document.querySelectorAll("[data-style]").forEach(function (button) {
    button.classList.toggle("selected", button.dataset.style === style);
  });
}

priceRange.addEventListener("input", function () {
  price = Number(priceRange.value);
  maxPrice.textContent = "$" + price;
});

applyButton.addEventListener("click", function () {
  currentPage = 1;
  filterProducts();

  if (window.innerWidth < 768) {
    filters.classList.remove("show");
  }
});

function filterProducts() {
  const params = new URLSearchParams(window.location.search);
  const search = params.get("search");
  const tag = params.get("tag");

  filteredProducts = products.filter(function (product) {
    if (
      search &&
      !product.name.toLowerCase().includes(search.toLowerCase()) &&
      !product.category.toLowerCase().includes(search.toLowerCase()) &&
      !product.style.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    if (tag && (!product.tags || !product.tags.includes(tag))) {
      return false;
    }

    if (category && product.category.toLowerCase() !== category.toLowerCase()) {
      return false;
    }

    if (
      color &&
      !product.colors.some(function (item) {
        return item.name.toLowerCase() === color.toLowerCase();
      })
    ) {
      return false;
    }

    if (
      size &&
      !product.sizes.some(function (item) {
        return item.toLowerCase() === size.toLowerCase();
      })
    ) {
      return false;
    }

    if (style && product.style.toLowerCase() !== style.toLowerCase()) {
      return false;
    }

    if (product.price > price) {
      return false;
    }

    return true;
  });

  sortProducts();
  showProducts();
  makePagination();
  updateCount();
}

sortBox.addEventListener("change", function () {
  sortProducts();

  currentPage = 1;

  showProducts();
  makePagination();
});

function sortProducts() {
  const value = sortBox.value;

  if (value === "price-low") {
    filteredProducts.sort(function (a, b) {
      return a.price - b.price;
    });
  } else if (value === "price-high") {
    filteredProducts.sort(function (a, b) {
      return b.price - a.price;
    });
  } else if (value === "rating") {
    filteredProducts.sort(function (a, b) {
      return b.rating - a.rating;
    });
  } else {
    filteredProducts.sort(function (a, b) {
      return b.reviewCount - a.reviewCount;
    });
  }
}

function showProducts() {
  productsBox.innerHTML = "";

  const start = (currentPage - 1) * productsPerPage;
  const pageProducts = filteredProducts.slice(start, start + productsPerPage);

  if (pageProducts.length === 0) {
    productsBox.innerHTML = `
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

    if (product.originalPrice > product.price) {
      oldPrice = `<span>$${product.originalPrice}</span>`;
    }

    if (product.discount > 0) {
      discount = `<small>-${product.discount}%</small>`;
    }

    productsBox.insertAdjacentHTML(
      "beforeend",
      `
      <div class="col">
        <article class="product-card">
          <a href="product.html?id=${product.id}">
            <div class="product-image">
              <img
                src="${product.images[0]}"
                alt="${product.name}"
              >
            </div>
          </a>

          <h3>${product.name}</h3>

          <div class="product-rating">
            <i class="bi bi-star-fill"></i>
            <span>${product.rating}/5</span>
          </div>

          <div class="product-price">
            <strong>$${product.price}</strong>
            ${oldPrice}
            ${discount}
          </div>
        </article>
      </div>
      `
    );
  });
}

function updateCount() {
  productCount.textContent = filteredProducts.length + " Products";
}

function makePagination() {
  pageNumbers.innerHTML = "";

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (totalPages <= 1) {
    previousPage.disabled = true;
    nextPage.disabled = true;
    return;
  }

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "page-number";
    button.textContent = i;

    if (i === currentPage) {
      button.classList.add("active");
    }

    button.addEventListener("click", function () {
      currentPage = i;

      showProducts();
      makePagination();
      window.scrollTo(0, 0);
    });

    pageNumbers.appendChild(button);
  }

  previousPage.disabled = currentPage === 1;
  nextPage.disabled = currentPage === totalPages;
}

previousPage.addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;

    showProducts();
    makePagination();
    window.scrollTo(0, 0);
  }
});

nextPage.addEventListener("click", function () {
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (currentPage < totalPages) {
    currentPage++;

    showProducts();
    makePagination();
    window.scrollTo(0, 0);
  }
});

function getUrlFilters() {
  const params = new URLSearchParams(window.location.search);

  const categoryFromUrl = params.get("category");
  const styleFromUrl = params.get("style");

  if (categoryFromUrl) {
    category = categoryFromUrl;
  }

  if (styleFromUrl) {
    style = styleFromUrl;
  }

  updateButtons();

  if (params.get("search")) {
    pageTitle.textContent = "Search";
    breadcrumb.textContent = "Search";
  } else if (params.get("tag") === "new") {
    pageTitle.textContent = "New Arrivals";
    breadcrumb.textContent = "New Arrivals";
  } else if (params.get("tag") === "top-selling") {
    pageTitle.textContent = "Top Selling";
    breadcrumb.textContent = "Top Selling";
  } else if (styleFromUrl) {
    pageTitle.textContent = styleFromUrl;
    breadcrumb.textContent = styleFromUrl;
  } else if (categoryFromUrl) {
    pageTitle.textContent = categoryFromUrl;
    breadcrumb.textContent = categoryFromUrl;
  } else {
    pageTitle.textContent = "Shop";
    breadcrumb.textContent = "Shop";
  }
}

if (openFilters) {
  openFilters.addEventListener("click", function () {
    filters.classList.add("show");
  });
}

if (closeFilters) {
  closeFilters.addEventListener("click", function () {
    filters.classList.remove("show");
  });
}
