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

    function setupPagination(handler){
        view.attachScrollOnWindowListener(handler);
    }

    function attachListeners(handlers){
        const currentPage = model.getCurrentPage();
        const itemsPerPage = model.getItemsPerPage();
        view.lazyLoadImages(currentPage, itemsPerPage);
        view.getMovieCards(currentPage, itemsPerPage).forEach((card) => {
            view.attachListeners(card, handlers.navigatonHandler).attachNavigationListener();
            view.attachListeners(card, function(){
                handlers.toggleFavouriteHandler.call(view.getFavouriteSvgFromMovieCard(this));
            }).attachEnterListener();
            view.attachListeners(card).attachFocusListener();
        });
        view.getFavouriteIcons(currentPage, itemsPerPage).forEach((icon) => {
            view.attachListeners(icon, handlers.toggleFavouriteHandler).attachClickListener();
        });
    }
    
    function defineEventHandlers(){
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

    return {
        initializeApp
    }
}
