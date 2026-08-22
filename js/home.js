fetch("data/products.json")
  .then(function (response) {
    return response.json();
  })
  .then(function (products) {
    const newProducts = products
      .filter(function (product) {
        return product.tags.includes("new");
      })
      .slice(0, 4);

    const topSelling = products
      .filter(function (product) {
        return product.tags.includes("top-selling");
      })
      .slice(0, 4);

    showProducts(newProducts, "new-arrivals");
    showProducts(topSelling, "top-selling");
  })
  .catch(function (error) {
    console.log("Could not load products:", error);
  });

function showProducts(products, containerId) {
  const container = document.getElementById(containerId);

  if (!container) {
    return;
  }

  container.innerHTML = "";

  products.forEach(function (product) {
    let oldPrice = "";
    let discount = "";

    if (Number(product.originalPrice) > Number(product.price)) {
      oldPrice = `<span>$${product.originalPrice}</span>`;
    }

    if (Number(product.discount) > 0) {
      discount = `<small>-${product.discount}%</small>`;
    }

    const card = `
      <div class="col-6 col-md-3">
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
            <i class="bi bi-star-fill" aria-hidden="true"></i>
            <span>${product.rating}/5</span>
          </div>

          <div class="product-price">
            <strong>$${product.price}</strong>
            ${oldPrice}
            ${discount}
          </div>

        </article>
      </div>
    `;

    container.insertAdjacentHTML("beforeend", card);
  });
}
