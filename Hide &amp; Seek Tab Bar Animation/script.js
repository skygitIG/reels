
    function addClass(elem) {
      for (let i = 0; i < elem.length; i++) {
        elem[i].addEventListener("click", function (e) {
          const current = this;
          for (let i = 0; i < elem.length; i++) {
            if (current !== elem[i]) {
              elem[i].classList.remove("isActive");
              elem[i].classList.add("notActive");
            } else {
              current.classList.add("isActive");
              current.classList.remove("notActive");
            }
          }
          e.preventDefault();
        });
      }
    }
    addClass(document.querySelectorAll(".link"));
