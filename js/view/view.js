import containerRowMeasures from "./containerMeasures.js";

function View(){
    const mainContainer = document.querySelector("main");

    const noContentClass = "no-content";
    const movieCardClass = "movie-card";
    const loaderClass = "loader";
    const favouriteiconClass = "favourite-svg";
    const favouriteIconMarkedClass = "favourite-svg-marked";

    function renderMovies(movies, posterPathPrefix, currentPage, itemsPerPage) {
      removeNoContentClassFromContainer();
      movies.forEach((movie, index) => {
          const movieCard = createMovieCard(currentPage, itemsPerPage, index);

          const movieImage = createMovieImage(movie, posterPathPrefix);
          const movieHeading = createMovieHeading(movie);
          const movieDetails = createMovieDetails(movie);

          movieCard.appendChild(movieImage);
          movieCard.appendChild(movieHeading);
          movieCard.appendChild(movieDetails);

          mainContainer.appendChild(movieCard);
        });

      
      function createMovieCard(currentPage, itemsPerPage, index) {
        const movieCard = document.createElement("article");
        movieCard.classList.add(movieCardClass);
        movieCard.setAttribute("tabindex", "0");
        movieCard.setAttribute("data-index", `${currentPage * itemsPerPage + index}`);
        return movieCard;
      }

      function createMovieImage(movie, posterPathPrefix) {
        const placeholderImg = document.createElement("section");
        placeholderImg.classList.add("placeholder-img");

        placeholderImg.appendChild(createPosterMovieImage());

        function createPosterMovieImage(){
          const posterMovieImg = document.createElement("img");
          posterMovieImg.classList.add("lazy-load");
          posterMovieImg.setAttribute("src", movie.poster_path ? posterPathPrefix + movie.poster_path : "/images/placeholder-image.jpg");
          posterMovieImg.setAttribute("loading", "lazy");
          posterMovieImg.setAttribute("alt", movie.original_title);
          return posterMovieImg;
        }

        return placeholderImg;
      }

      function createMovieHeading(movie) {
        const movieHeading = document.createElement("h2");
        movieHeading.textContent = movie.title;
        return movieHeading;
      }

      function createMovieDetails(movie) {
        const movieDetailsSection = document.createElement("section");
        movieDetailsSection.classList.add("movie-details");
        
        movieDetailsSection.appendChild(createReleaseDate());
        movieDetailsSection.appendChild(createFavouriteIcon());

        function createReleaseDate() {
          const movieReleaseDate = document.createElement("p");
          movieReleaseDate.textContent = movie.release_date ? movie.release_date : "Unknown date";
          return movieReleaseDate;
        }

        function createFavouriteIcon() {
          const favouriteMovieSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          favouriteMovieSvg.classList.add(favouriteiconClass);
          favouriteMovieSvg.setAttribute("viewBox", "0 0 24 24");
          favouriteMovieSvg.setAttribute("fill", "none");
          favouriteMovieSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          favouriteMovieSvg.innerHTML = `
            <path d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"/>
            `;
          return favouriteMovieSvg;
        }

        return movieDetailsSection;
      }


      function removeNoContentClassFromContainer() {
        mainContainer.classList.remove(noContentClass);
      }
    }
    
    function setLoader() {
      mainContainer.innerHTML = `<div class="${loaderClass}"></div>`;
      containerNoContentAdjustment();
    }
    
    function removeLoader() {
        const loader = document.querySelector(`.${loaderClass}`);
        if (loader) loader.remove();
    }
    
    function handleNoContent(text) {
      containerNoContentAdjustment();
      mainContainer.innerHTML = `<h2>${text}</h2>`;
    }
    
    function containerNoContentAdjustment() {
      if (mainContainer.classList.contains(noContentClass)) return;
      mainContainer.classList.add(noContentClass);
    }

    function getSlicedElements(elements, currentPage, itemsPerPage) {
      return Array.from(elements).slice(currentPage * itemsPerPage, (currentPage + 1) * itemsPerPage);
    }
    
    function lazyLoadImages(currentPage, itemsPerPage) {
      const imagePlaceholders = getSlicedElements(document.querySelectorAll(".placeholder-img"), currentPage, itemsPerPage);
      imagePlaceholders.forEach((placeholder) => {
        const image = placeholder.querySelector("img");
    
        function loaded() {
          image.removeEventListener("load", loaded);
          image.classList.add("loaded");
        }
    
        if (image.complete) {
          loaded();
        } else {
          image.addEventListener("load", loaded);
        }
      });
    }

    function getMovieCards(currentPage, itemsPerPage) {
        return getSlicedElements(mainContainer.querySelectorAll(`.${movieCardClass}`), currentPage, itemsPerPage);
    }

    function getFavouriteIcons(currentPage, itemsPerPage) {
        return getSlicedElements(mainContainer.querySelectorAll(".favourite-svg"), currentPage, itemsPerPage);
    }

    function applyFocusToElement(current, position) {
        let elementToFocus = current;
        if(position > 0) goForward();
        else goBackward();
        elementToFocus.focus();

        function goForward(){
          while(position > 0){
              if(!elementToFocus.nextElementSibling) break;
              elementToFocus = elementToFocus.nextElementSibling;
              position--;
            }
        }

        function goBackward(){
          while(position < 0){
              if(!elementToFocus.previousElementSibling) break;
              elementToFocus = elementToFocus.previousElementSibling;
              position++;
            }
        }
    }

    
    function attachListeners(element, handler){
  
      function attachNavigationListener(){
          element.addEventListener("keydown", handler);
      }
  
      function attachEnterListener(){
          element.addEventListener("keydown", function(event){
              if(event.key == "Enter") handler.call(this);
          });
      }
  
      function attachFocusListener(){
          element.addEventListener("focus", function(event){
              scrollToElement();
              if(handler && typeof handler == 'function') additionalHandler(event);
  
              function scrollToElement(){
                element.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              }
          });
      }

      function attachClickListener(){
          element.addEventListener("click", handler);
      }

      return {
          attachNavigationListener,
          attachEnterListener,
          attachFocusListener,
          attachClickListener,
      }
    }
    


    function toggleFavouriteIcon() {
        this.classList.toggle(favouriteIconMarkedClass);
    }

    function getScrollMeasures(){
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        return { scrollTop, scrollHeight, clientHeight };
    }

    function attachScrollOnWindowListener(handler){
        window.addEventListener("scroll", handler);
    }

    function getFavouriteSvgFromMovieCard(card){
        return card.querySelector(`.${favouriteiconClass}`);
    }

    return {
      renderMovies,
      lazyLoadImages, 
      setLoader,
      removeLoader,
      handleNoContent,
      toggleFavouriteIcon,
      applyFocusToElement,
      attachListeners,
      attachScrollOnWindowListener,
      getMovieCards,
      getFavouriteIcons,
      getScrollMeasures,
      getFavouriteSvgFromMovieCard,
      getContainerRowMeasures: function () {
        return containerRowMeasures(mainContainer, movieCardClass);
      },
    };
}

export default View;
