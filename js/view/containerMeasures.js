function containerRowMeasures(mainContainer, movieCardClass) {
  function getComputedStyleOfContainer() {
    return getComputedStyle(mainContainer);
  }

  function getContainerDimensions(computedStyle) {
    return {
      containerPaddingLeft: parseFloat(computedStyle.paddingLeft),
      containerPaddingRight: parseFloat(computedStyle.paddingRight),
      gap: computedStyle.gap,
    };
  }

  function getMovieCardDimensions() {
    return mainContainer.querySelector(`.${movieCardClass}`).offsetWidth;
  }

  function getContainerWidth() {
    return mainContainer.clientWidth;
  }
  return {
    getComputedStyleOfContainer,
    getContainerDimensions,
    getMovieCardDimensions,
    getContainerWidth,
  };
}

export { containerRowMeasures };

