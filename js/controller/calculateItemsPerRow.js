export default function (view){
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
}