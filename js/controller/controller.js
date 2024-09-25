import Model from '../model/model.js';
import { removeDuplicates, sortByImdbRating } from '../model/operations.js';
import View from '../view/view.js';

import calculateItemsPerRow from './calculateItemsPerRow.js';


const controller = Controller();
controller.initializeApp();


function Controller(){
    const model = Model();
    const view = View();

    async function initializeApp() {
        const loaderAPI = view.getLoaderAPI();
        try {
            loaderAPI.setLoader();
            await model.getMovies(removeDuplicates, sortByImdbRating);
            loaderAPI.removeLoader();
            createUI();
        } catch (error) { 
            view.handleNoContent(error.message);
        }
    }
    
    function createUI(){
        try {
            renderMovies();
            initializeEventHandlers();
            model.goToNextPage();
        } catch (error) {
            view.handleNoContent(error.message);
        }

        function initializeEventHandlers(){
            const handlers = defineEventHandlers();
            setupPagination(handlers.scrollHandler);
            attachListeners(handlers);
        }
    }

    function renderMovies(){
        const movies = model.getPaginatedData();
        if(!movies) throw new Error("No movies to render");
        view.renderMovies({
            movies,
            moviesPosterPathPrefix: model.getMoviePosterPathPrefix(),
            currentPage: model.getCurrentPage(),
            itemsPerPage: model.getItemsPerPage()
        });
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

    function setupPagination(handler){
        view.attachListeners({handler}).attachScrollOnListener();
    }

    function attachListeners(handlers){
        const currentPage = model.getCurrentPage();
        const itemsPerPage = model.getItemsPerPage();
        const elementsAPI = view.getElementsAPI();
        view.lazyLoadImages(currentPage, itemsPerPage);
        elementsAPI.getMovieCards(currentPage, itemsPerPage).forEach((card) => {
            view.attachListeners({element: card,
                                handler: handlers.navigatonHandler}).attachNavigationListener();
            view.attachListeners({element: card, 
                                handler: function(){
                handlers.toggleFavouriteHandler.call(elementsAPI.getFavouriteSvgFromMovieCard(this));
            }}).attachEnterListener();
            view.attachListeners({element: card}).attachFocusListener();
        });
        elementsAPI.getFavouriteIcons(currentPage, itemsPerPage).forEach((icon) => {
            view.attachListeners({element: icon, 
                                handler: handlers.toggleFavouriteHandler}).attachClickListener();
        });
    }
    
    function defineEventHandlers(){
        const { DIRECTION, offsetScrollLoader } = getConfig();

        function navigatonHandler(event){
            if (DIRECTION.RIGHT.condition(event)) view.applyFocusToElement(this, DIRECTION.RIGHT.action());
            else if (DIRECTION.LEFT.condition(event)) view.applyFocusToElement(this, DIRECTION.LEFT.action());
            else if (DIRECTION.DOWN.condition(event)) view.applyFocusToElement(this, DIRECTION.DOWN.action());  
            else if (DIRECTION.UP.condition(event)) view.applyFocusToElement(this, DIRECTION.UP.action());
        }

        function scrollHandler(){
            const { scrollTop, scrollHeight, clientHeight } = view.getMeasuresAPI().getScrollMeasures();
            if (scrollTop + clientHeight >= scrollHeight - offsetScrollLoader) loadMoreMovies({navigatonHandler, toggleFavouriteHandler});
        }

        function toggleFavouriteHandler(){
            view.toggleFavouriteIcon.call(this);
        }

        function getConfig(){
            const recalculateItemsPerRow = calculateItemsPerRow(view);
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

            return {
                DIRECTION,
                recalculateItemsPerRow,
                offsetScrollLoader
            }
        }

        return {
            navigatonHandler,
            toggleFavouriteHandler,
            scrollHandler
        }
    }

    return {
        initializeApp
    }
}
