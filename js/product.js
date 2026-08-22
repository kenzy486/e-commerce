const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

let product = null;
let color = "";
let size = "";
let quantity = 1;

let visibleReviews = 4;
let reviewSort = "latest";

const reviews = [
  {
    productId: "graphic-blue-tshirt",
    name: "Sarah M.",
    rating: 5,
    text: "The quality is amazing and the shirt looks exactly like the pictures. I absolutely love it!",
    date: "August 12, 2026",
  },
  {
    productId: "graphic-blue-tshirt",
    name: "Alex K.",
    rating: 5,
    text: "Great quality and fast delivery. The fit is perfect and I will definitely shop here again.",
    date: "August 10, 2026",
  },
  {
    productId: "graphic-blue-tshirt",
    name: "James L.",
    rating: 4.5,
    text: "The material feels really comfortable and the design looks fantastic. Highly recommended.",
    date: "August 8, 2026",
  },
  {
    productId: "graphic-blue-tshirt",
    name: "Emily R.",
    rating: 5,
    text: "Really impressed with the quality. It fits perfectly and feels great to wear.",
    date: "August 5, 2026",
  },
  {
    productId: "graphic-blue-tshirt",
    name: "Michael B.",
    rating: 4.5,
    text: "Very good product for the price. The colors are exactly as shown online.",
    date: "August 2, 2026",
  },
  {
    productId: "graphic-blue-tshirt",
    name: "Olivia T.",
    rating: 5,
    text: "I ordered this as a gift and it was even better than expected. Excellent quality.",
    date: "July 30, 2026",
  },
];

document.addEventListener("DOMContentLoaded", function () {
  loadProduct();
  setupReviewSort();
  setupReviewForm();
  setupLoadMore();
});

function loadProduct() {
  fetch("data/products.json")
    .then(function (response) {
      return response.json();
    })
    .then(function (products) {
      product = products.find(function (item) {
        return item.id === productId;
      });

      if (!product) {
        showProductNotFound();
        return;
      }

      displayProduct();
      displayReviews();
      displayRelatedProducts(products);
    })
    .catch(function (error) {
      console.log("Could not load product:", error);
    });
}

function displayProduct() {
  document.getElementById("product-name").textContent = product.name;

  document.getElementById("product-rating").textContent = product.rating + "/5";

  document.getElementById("product-stars").innerHTML = createStars(
    product.rating
  );

  document.getElementById("product-price").textContent = "$" + product.price;

  const oldPrice = document.getElementById("product-original-price");

  const discount = document.getElementById("product-discount");

  if (Number(product.originalPrice) > Number(product.price)) {
    oldPrice.textContent = "$" + product.originalPrice;
  } else {
    oldPrice.textContent = "";
  }

  if (Number(product.discount) > 0) {
    discount.textContent = "-" + product.discount + "%";
  } else {
    discount.textContent = "";
  }

  document.getElementById("product-description").textContent =
    product.description;

  document.getElementById("breadcrumb-product").textContent = product.name;

  displayImages();
  displayColors();
  displaySizes();
  setupQuantity();
}

function displayImages() {
  const mainImage = document.getElementById("product-image");

  const thumbnails = document.getElementById("product-thumbnails");

  thumbnails.innerHTML = "";

  if (!product.images || product.images.length === 0) {
    return;
  }

  mainImage.src = product.images[0];
  mainImage.alt = product.name;

  product.images.forEach(function (image, index) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "product-thumbnail";

    if (index === 0) {
      button.classList.add("selected");
    }

    button.innerHTML = `
      <img
        src="${image}"
        alt="${product.name}"
      >
    `;

    button.addEventListener("click", function () {
      mainImage.src = image;

      document.querySelectorAll(".product-thumbnail").forEach(function (item) {
        item.classList.remove("selected");
      });

      button.classList.add("selected");
    });

    thumbnails.appendChild(button);
  });
}

function displayColors() {
  const container = document.getElementById("product-colors");

  const selectedText = document.getElementById("selected-color");

  container.innerHTML = "";

  if (!product.colors || product.colors.length === 0) {
    return;
  }

  product.colors.forEach(function (item, index) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "color-option";
    button.style.backgroundColor = item.hex;
    button.title = item.name;
    button.setAttribute("aria-label", item.name);

    if (index === 0) {
      color = item.name;
      button.classList.add("selected");
    }

    button.addEventListener("click", function () {
      color = item.name;

      document
        .querySelectorAll("#product-colors .color-option")
        .forEach(function (item) {
          item.classList.remove("selected");
        });

      button.classList.add("selected");

      selectedText.textContent = "Selected: " + color;
    });

    container.appendChild(button);
  });

  selectedText.textContent = "Selected: " + color;
}

function displaySizes() {
  const container = document.getElementById("product-sizes");

  const selectedText = document.getElementById("selected-size");

  container.innerHTML = "";

  if (!product.sizes || product.sizes.length === 0) {
    return;
  }

  product.sizes.forEach(function (item, index) {
    const button = document.createElement("button");

    button.type = "button";
    button.className = "size-option";
    button.textContent = item;

    if (index === 0) {
      size = item;
      button.classList.add("selected");
    }

    button.addEventListener("click", function () {
      size = item;

      document
        .querySelectorAll("#product-sizes .size-option")
        .forEach(function (item) {
          item.classList.remove("selected");
        });

      button.classList.add("selected");

      selectedText.textContent = "Selected: " + size;
    });

    container.appendChild(button);
  });

  selectedText.textContent = "Selected: " + size;
}

function setupQuantity() {
  const quantityText = document.getElementById("quantity");

  const increase = document.getElementById("increase-quantity");

  const decrease = document.getElementById("decrease-quantity");

  const addButton = document.getElementById("add-to-cart");

  quantity = 1;
  quantityText.textContent = quantity;

  increase.addEventListener("click", function () {
    if (quantity < product.stock) {
      quantity++;
      quantityText.textContent = quantity;
    }
  });

  decrease.addEventListener("click", function () {
    if (quantity > 1) {
      quantity--;
      quantityText.textContent = quantity;
    }
  });

  addButton.addEventListener("click", function () {
    addToCart();
  });
}

function addToCart() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];

  const item = cart.find(function (item) {
    return item.id === product.id && item.color === color && item.size === size;
  });

  if (item) {
    item.quantity = Math.min(item.quantity + quantity, product.stock);
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      color: color,
      size: size,
      quantity: quantity,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));

  alert("Product added to cart!");
}

function displayReviews() {
  const container = document.getElementById("product-reviews");

  const count = document.getElementById("review-count");

  const button = document.getElementById("load-more-reviews");

  if (!container) {
    return;
  }

  let productReviews = reviews.filter(function (review) {
    return review.productId === productId;
  });

  if (reviewSort === "highest") {
    productReviews.sort(function (a, b) {
      return b.rating - a.rating;
    });
  }

  if (reviewSort === "lowest") {
    productReviews.sort(function (a, b) {
      return a.rating - b.rating;
    });
  }

  if (reviewSort === "oldest") {
    productReviews.reverse();
  }

  count.textContent = "(" + productReviews.length + ")";

  container.innerHTML = "";

  if (productReviews.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-4">
        <h3>No reviews yet</h3>
        <p class="text-muted">
          Be the first person to review this product.
        </p>
      </div>
    `;

    button.style.display = "none";
    return;
  }

  const reviewsToShow = productReviews.slice(0, visibleReviews);

  reviewsToShow.forEach(function (review) {
    const col = document.createElement("div");

    col.className = "col-12 col-md-6";

    col.innerHTML = `
      <article class="review-card h-100 p-4 border rounded-4">

        <div class="d-flex justify-content-between align-items-start">
          <div class="review-stars text-warning">
            ${createStars(review.rating)}
          </div>

          <button
            type="button"
            class="btn btn-sm border-0"
            aria-label="Review options"
          >
            <i class="bi bi-three-dots"></i>
          </button>
        </div>

        <h3 class="h6 fw-bold mt-3 mb-1">
          ${review.name}
          <i class="bi bi-patch-check-fill text-success"></i>
        </h3>

        <p class="text-muted mb-3">
          "${review.text}"
        </p>

        <small class="text-muted">
          Posted on ${review.date}
        </small>

      </article>
    `;

    container.appendChild(col);
  });

  if (visibleReviews >= productReviews.length) {
    button.style.display = "none";
  } else {
    button.style.display = "inline-block";
  }
}

function createStars(rating) {
  let stars = "";
  const number = Number(rating);

  for (let i = 1; i <= 5; i++) {
    if (number >= i) {
      stars += '<i class="bi bi-star-fill"></i>';
    } else if (number >= i - 0.5) {
      stars += '<i class="bi bi-star-half"></i>';
    } else {
      stars += '<i class="bi bi-star"></i>';
    }
  }

  return stars;
}

function setupLoadMore() {
  const button = document.getElementById("load-more-reviews");

  if (!button) {
    return;
  }

  button.addEventListener("click", function () {
    visibleReviews += 4;
    displayReviews();
  });
}

function setupReviewSort() {
  document.querySelectorAll(".review-sort-option").forEach(function (option) {
    option.addEventListener("click", function () {
      reviewSort = this.dataset.sort;
      visibleReviews = 4;

      displayReviews();
    });
  });
}

function setupReviewForm() {
  const form = document.getElementById("review-form");

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("review-name").value.trim();

    const rating = Number(document.getElementById("review-rating").value);

    const text = document.getElementById("review-text").value.trim();

    const date = new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

    reviews.unshift({
      productId: productId,
      name: name,
      rating: rating,
      text: text,
      date: date,
    });

    visibleReviews = 4;
    reviewSort = "latest";

    displayReviews();

    form.reset();

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("reviewModal")
    );

    if (modal) {
      modal.hide();
    }
  });
}

function displayRelatedProducts(products) {
  const container = document.getElementById("related-products");

  if (!container) {
    return;
  }

  const related = products
    .filter(function (item) {
      return item.id !== product.id && item.category === product.category;
    })
    .slice(0, 4);

  container.innerHTML = "";

  related.forEach(function (item) {
    const col = document.createElement("div");

    col.className = "col";

    const oldPrice =
      Number(item.originalPrice) > Number(item.price)
        ? `<span>$${item.originalPrice}</span>`
        : "";

    const discount =
      Number(item.discount) > 0 ? `<small>-${item.discount}%</small>` : "";

    col.innerHTML = `
      <article class="product-card">

        <a href="product.html?id=${item.id}">
          <div class="product-image">
            <img
              src="${item.images[0]}"
              alt="${item.name}"
              class="img-fluid"
            >
          </div>
        </a>

        <h3>${item.name}</h3>

        <div class="product-rating">
          <div class="rating-stars">
            ${createStars(item.rating)}
          </div>

          <span>${item.rating}/5</span>
        </div>

        <div class="product-price">
          <strong>$${item.price}</strong>
          ${oldPrice}
          ${discount}
        </div>

      </article>
    `;

    container.appendChild(col);
  });
}

function showProductNotFound() {
  const productSection = document.querySelector(".product-details");

  if (!productSection) {
    return;
  }

  productSection.innerHTML = `
    <div class="container text-center py-5">

      <h2>Product not found</h2>

      <p class="text-muted">
        The product you're looking for does not exist.
      </p>

      <a href="category.html" class="btn btn-dark">
        Back to Shop
      </a>

    </div>
  `;
}
