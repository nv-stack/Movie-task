function Model(){
    const baseUrl = "/source/movies.json";
    const moviePosterPathPrefix = "https://image.tmdb.org/t/p/w500";

    let currentPage = 0;
    let itemsPerPage = 100;

    let pages;

    async function fetchMovies() {
        try {
            const response = await fetch(baseUrl);
            console.log(response);
            if (response.status != 200) throw new Error("Cannot fetch the data");
            return await response.json();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    async function getMovies(...dataTransformationFunctions) {
        try {
            if(!isSessionStorageEmpty()) {
                calculatePages(getMoviesFromSessionStorage());
                return;
            }
            const data = await fetchMovies();
            const modifedData = applyDataTransformations(data);
            storeInSessionStorage(modifedData);
            calculatePages(modifedData);
        } catch (error) {
            throw new Error(error.message);
        }

        function applyDataTransformations(data) {
          for (const func of dataTransformationFunctions) {
            if (typeof func == "function") {
              validateData(data);
              data = func(data);
            }
          }
          return data;
        }
        
        function validateData(data) {
            if(!data || !Array.isArray(data)) throw new Error("Invalid data");
        }
    }

    function getPaginatedData() {
        if((currentPage + 1) > pages) return;
        const data = getMoviesFromSessionStorage();
        const start = currentPage * itemsPerPage;
        const end = start + itemsPerPage;
        return data.slice(start, end);
    }

    function calculatePages(data) {
        pages = Math.ceil(data.length / itemsPerPage);
    }

    function storeInSessionStorage(data) {
        sessionStorage.setItem("movies", JSON.stringify(data));
    }

    function isSessionStorageEmpty() {
        return sessionStorage.getItem("movies") === null;
    }

    function getMoviesFromSessionStorage() {
        const result = JSON.parse(sessionStorage.getItem("movies"));
        emptyDataValidation(result);
        return result;
    }

    function emptyDataValidation(data) {
        if(data.length === 0) throw new Error("No movies to display");
    }

    function goToNextPage() {
        currentPage++;
    }

    function getCurrentPage() {
        return currentPage;
    }

    function getItemsPerPage() {
        return itemsPerPage;
    }

    return {
        getMovies,
        moviePosterPathPrefix,
        goToNextPage,
        getPaginatedData,
        getCurrentPage,
        getItemsPerPage
    }
}

export default Model;

