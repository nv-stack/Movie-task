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
            createUI();
        } catch (error) { 
            view.handleNoContent(error.message);
        }
    }
    
    function createUI(){
        try {
            renderMovies();
            proceedHandlers();
            model.goToNextPage();
        } catch (error) {
            view.handleNoContent(error.message);
        }

        function proceedHandlers(){
            const handlers = setupEventHandlers();
            applyPaginationMechanic(handlers.scrollHandler);
            attachListeners(handlers);
        }
    }

    function renderMovies(){
        const data = model.getPaginatedData();
        if(!data) throw new Error("No movies to render");
        view.renderMovies(data, model.moviePosterPathPrefix, model.getCurrentPage(), model.getItemsPerPage());
    }

    function loadMoreMovies(handlers){
        try{
            renderMovies();
            attachListeners(handlers);
            model.goToNextPage();
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
            view.attachEnterListener(card, function(){
                handlers.toggleFavouriteHandler.call(view.getFavouriteSvgFromMovieCard(this));
            });
            view.attachFocusListener(card);
        });
        view.getFavouriteIcons(currentPage, itemsPerPage).forEach((icon) => {
            view.attachClickListener(icon, handlers.toggleFavouriteHandler);
        });
    }
    
    function setupEventHandlers(){
        const recalculateItemsPerRow = calculateItemsPerRow();
        const offsetScrollLoader = 5;

        const DIRECTION = {
            UP: {
                condition: (event) => event.key == "ArrowUp" || event.key == "w" || event.key == "W",
                action: () => -recalculateItemsPerRow()
            },
            DOWN: {
                condition: (event) => event.key == "ArrowDown" || event.key == "s" || event.key == "S",
                action: () => recalculateItemsPerRow()
            },
            LEFT: {
                condition: (event) => event.key == "ArrowLeft" || event.key == "a" || event.key == "A",
                action: () => -1
            },
            RIGHT: {
                condition: (event) => event.key == "ArrowRight" || event.key == "d" || event.key == "D",
                action: () => 1
            }
        };

        function navigatonHandler(event){
            if (DIRECTION.RIGHT.condition(event)) view.applyFocusToElement(this, DIRECTION.RIGHT.action());
            else if (DIRECTION.LEFT.condition(event)) view.applyFocusToElement(this, DIRECTION.LEFT.action());
            else if (DIRECTION.DOWN.condition(event)) view.applyFocusToElement(this, DIRECTION.DOWN.action());  
            else if (DIRECTION.UP.condition(event)) view.applyFocusToElement(this, DIRECTION.UP.action());
        }

        function scrollHandler(){
            const { scrollTop, scrollHeight, clientHeight } = view.getScrollMeasures();
            if (scrollTop + clientHeight >= scrollHeight - offsetScrollLoader) loadMoreMovies({navigatonHandler, toggleFavouriteHandler});
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
