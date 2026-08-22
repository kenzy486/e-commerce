fetch("components/header.html")
  .then(function (response) {
    return response.text();
  })
  .then(function (data) {
    document.getElementById("header").innerHTML = data;

    setupPromo();
    setupSearch();
  })
  .catch(function (error) {
    console.log("Could not load header:", error);
  });

fetch("components/footer.html")
  .then(function (response) {
    return response.text();
  })
  .then(function (data) {
    document.getElementById("footer").innerHTML = data;
  })
  .catch(function (error) {
    console.log("Could not load footer:", error);
  });

function setupPromo() {
  const closeButton = document.querySelector(".promo-close");
  const promoBar = document.querySelector(".promo-bar");

  if (!closeButton || !promoBar) {
    return;
  }

  closeButton.addEventListener("click", function () {
    promoBar.style.display = "none";
  });
}

function setupSearch() {
  const inputs = document.querySelectorAll(".search-input");
  const buttons = document.querySelectorAll(".search-icon");

  inputs.forEach(function (input) {
    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        searchProducts(input.value);
      }
    });
  });

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const box = button.closest(".search-box, .mobile-search-box");

      if (!box) {
        return;
      }

      const input = box.querySelector(".search-input");

      if (input) {
        searchProducts(input.value);
      }
    });
  });
}

function searchProducts(text) {
  const search = text.trim();

  if (!search) {
    return;
  }

  window.location.href = "category.html?search=" + encodeURIComponent(search);
}
