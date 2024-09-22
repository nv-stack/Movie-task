export default function (view){
    const { getComputedStyleOfContainer,
            getContainerDimensions,
            getMovieCardDimensions,
            getContainerWidth
    } = view.getContainerRowMeasures();
    
    let containerDimesions = getContainerDimensions(getComputedStyleOfContainer());
    let containerPaddingLeft = containerDimesions.containerPaddingLeft;
    let containerPaddingRight = containerDimesions.containerPaddingRight;
    let containerWidth = calculateContainerWidth();
    let itemWidth = getMovieCardDimensions();
    let gap = calculateGapWidth();
    let itemsPerRow = calculateItemsPerRow();

    function calculateContainerWidth(){
        return getContainerWidth() - containerPaddingLeft - containerPaddingRight
    }

    function calculateGapWidth(){
        return parseFloat(containerDimesions.gap) || 0;
    }

    function calculateItemsPerRow(){
        return Math.floor((containerWidth + gap) / (itemWidth + gap));
    }

    function isSameContainerWidth(){
        return containerWidth == getContainerWidth() - containerPaddingLeft - containerPaddingRight;
    }

    return function () {
        if (isSameContainerWidth()) return itemsPerRow;
        console.log("Re-calculating items per row");
        containerDimesions = getContainerDimensions(getComputedStyleOfContainer());
        containerPaddingLeft = containerDimesions.containerPaddingLeft;
        containerPaddingRight = containerDimesions.containerPaddingRight;
        containerWidth = calculateContainerWidth();
        itemWidth = getMovieCardDimensions();
        gap = calculateGapWidth();
        itemsPerRow = calculateItemsPerRow();
        return itemsPerRow;
    };
}