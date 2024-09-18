import Model from './model/model.js';
import { removeDuplicates, sortByImdbRating } from './model/operations.js';
import View from './view/view.js';


const controller = Controller();
controller.initializeApp();


function Controller(){
    const model = Model();
    const view = View();

    async function initializeApp() {
        try {
            view.setLoader();
            await model.getMovies(removeDuplicates, sortByImdbRating);
            view.removeLoader();
            prepareAndRenderMovies();
        } catch (error) { 
            view.handleNoContent(error.message);
        }
    }
    
    function prepareAndRenderMovies(){
        try {
            renderMovies();
            const handlers = setupEventHandlers();
            applyPaginationMechanic(handlers.scrollHandler);
            attachListeners(handlers);
            model.increaseCurrentPage();
        } catch (error) {
            view.handleNoContent(error.message);
        }
    }

    function renderMovies(){
        const data = model.getPaginatedData();
        if(!data) throw new Error("No movies to render");
        view.renderMovies(data, model.moviePosterPathPrefix, model.getCurrentPage(), model.getItemsPerPage());
    }

    function laodMoreMovies(handlers){
        try{
            renderMovies();
            attachListeners(handlers);
            model.increaseCurrentPage();
        } catch (error) {
            console.log(error.message);
        }
    }

    function applyPaginationMechanic(handler){
        view.attachScrollOnWindowListener(handler);
    }

    function attachListeners(handlers){
        const currentPage = model.getCurrentPage();
        const itemsPerPage = model.getItemsPerPage();
        view.lazyLoadImages(currentPage, itemsPerPage);
        view.getMovieCards(currentPage, itemsPerPage).forEach((card) => {
            view.attachNavigationListener(card, handlers.navigatonHandler);
            view.attachFocusListener(card);
        });
        view.getFavouriteIcons(currentPage, itemsPerPage).forEach((icon) => {
            view.attachClickListener(icon, handlers.toggleFavouriteHandler);
        });
    }
    
    function setupEventHandlers(){
        const recalculateItemsPerRow = calculateItemsPerRow();
        const offsetScrollLoader = 5;
        function navigatonHandler(event){
            if (event.key == "Enter") 
                view.toggleFavouriteIcon.call(view.getFavouriteSvgFromMovieCard(this));
            else if (
                event.key == "ArrowRight" ||
                event.key == "d" ||
                event.key == "D"
            ) view.applyFocusToElement(this, 1);
            else if (
                event.key == "ArrowLeft" ||
                event.key == "a" ||
                event.key == "A"
            ) view.applyFocusToElement(this, -1);
            else if (
                event.key == "ArrowDown" ||
                event.key == "s" ||
                event.key == "S"
            ){
                console.log(recalculateItemsPerRow());
              view.applyFocusToElement(this, recalculateItemsPerRow());  
            } 
            else if (
                event.key == "ArrowUp" ||
                event.key == "w" ||
                event.key == "W"
            ) view.applyFocusToElement(this, -recalculateItemsPerRow());
        }

        function scrollHandler(){
            const { scrollTop, scrollHeight, clientHeight } = view.getScrollMeasures();
            if (scrollTop + clientHeight >= scrollHeight - offsetScrollLoader) laodMoreMovies({navigatonHandler, toggleFavouriteHandler});
        }

        function toggleFavouriteHandler(){
            view.toggleFavouriteIcon.call(this);
        }
        return {
            navigatonHandler,
            toggleFavouriteHandler,
            scrollHandler
        }
    }

    function calculateItemsPerRow() {
        const { getComputedStyleOfContainer,
                getContainerDimensions,
                getMovieCardDimensions,
                getContainerWidth
        } = view.getContainerRowMeasures();
        let containerDimesions = getContainerDimensions(getComputedStyleOfContainer());
        let containerPaddingLeft = containerDimesions.containerPaddingLeft;
        let containerPaddingRight = containerDimesions.containerPaddingRight;
        let containerWidth = getContainerWidth() - containerPaddingLeft - containerPaddingRight;
        let itemWidth = getMovieCardDimensions();
        let gap = parseFloat(containerDimesions.gap) || 0;
        let itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
    
        return function () {
          if (containerWidth == getContainerWidth() - containerPaddingLeft - containerPaddingRight)
            return itemsPerRow;
          console.log("Re-calculating items per row");
          containerDimesions = getContainerDimensions(getComputedStyleOfContainer());
          containerPaddingLeft = containerDimesions.containerPaddingLeft;
          containerPaddingRight = containerDimesions.containerPaddingRight;
          containerWidth = getContainerWidth() - containerPaddingLeft - containerPaddingRight;
          itemWidth = getMovieCardDimensions();
          gap = parseFloat(containerDimesions.gap) || 0;
          itemsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
          return itemsPerRow;
        };
    };

    return {
        initializeApp
    }
}
